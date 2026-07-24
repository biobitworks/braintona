import { createHash } from "node:crypto";

export interface GoldTask {
  task_id: string;
  source: string;
  gold_claims: string[];
  precision_floor: number;
  recall_floor: number;
}

export interface EvalResult {
  backend: "braintrust" | "local_gold";
  task_id: string;
  precision: number;
  recall: number;
  f1: number;
  pass: boolean;
  predicted: string[];
  missed: string[];
  extra: string[];
  experiment_id?: string;
  span_id?: string;
}

const DEFAULT_TASK: GoldTask = {
  task_id: "braintona.gold.v1",
  source:
    "Fractal Custody Objects bind sha256 of recorded bytes with domain separation (leaf 0x00, node 0x01). Custody proves provenance of a run, not scientific correctness. Glasswork selected the cheapest open model that cleared a pre-set quality bar on a gold claim-extraction task.",
  gold_claims: [
    "Fractal Custody Objects bind sha256 of recorded bytes with domain separation",
    "Custody proves provenance of a run, not scientific correctness",
    "Glasswork selected the cheapest open model that cleared a pre-set quality bar",
  ],
  precision_floor: 0.5,
  recall_floor: 0.5,
};

export function getDefaultTask(): GoldTask {
  return DEFAULT_TASK;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function parseClaims(text: string): string[] {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through — split lines
  }
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function overlap(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wa = new Set(na.split(" "));
  const wb = nb.split(" ");
  const hit = wb.filter((w) => w.length > 3 && wa.has(w)).length;
  return hit >= Math.max(2, Math.floor(wb.length * 0.5));
}

export function scoreLocal(task: GoldTask, modelText: string): EvalResult {
  const predicted = parseClaims(modelText);
  const matchedGold = new Set<number>();
  const matchedPred = new Set<number>();
  const extra: string[] = [];

  predicted.forEach((p, i) => {
    let hit = false;
    task.gold_claims.forEach((g, gi) => {
      if (overlap(p, g)) {
        matchedGold.add(gi);
        matchedPred.add(i);
        hit = true;
      }
    });
    if (!hit) extra.push(p);
  });

  const tp = matchedPred.size;
  const precision = predicted.length ? tp / predicted.length : 0;
  const recall = task.gold_claims.length ? matchedGold.size / task.gold_claims.length : 0;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  const missed = task.gold_claims.filter((_, i) => !matchedGold.has(i));
  const pass = precision >= task.precision_floor && recall >= task.recall_floor;

  return {
    backend: "local_gold",
    task_id: task.task_id,
    precision,
    recall,
    f1,
    pass,
    predicted,
    missed,
    extra,
  };
}

/** Best-effort Braintrust log; never blocks demo if SDK/key missing. */
export async function maybeLogBraintrust(evalResult: EvalResult, meta: Record<string, unknown>): Promise<EvalResult> {
  const key = process.env.BRAINTRUST_API_KEY;
  if (!key) return evalResult;

  try {
    const braintrust = await import("braintrust");
    const logger = braintrust.initLogger({
      projectName: process.env.BRAINTRUST_PROJECT || "braintona-hacksprint",
      apiKey: key,
    });
    const span = logger.startSpan({ name: "braintona.eval" });
    span.log({
      input: meta,
      output: {
        precision: evalResult.precision,
        recall: evalResult.recall,
        f1: evalResult.f1,
        pass: evalResult.pass,
      },
      scores: {
        precision: evalResult.precision,
        recall: evalResult.recall,
        f1: evalResult.f1,
        pass: evalResult.pass ? 1 : 0,
      },
    });
    span.end();
    await logger.flush();
    return {
      ...evalResult,
      backend: "braintrust",
      experiment_id: "braintona-hacksprint",
      span_id: createHash("sha256").update(JSON.stringify(evalResult)).digest("hex").slice(0, 16),
    };
  } catch (err) {
    console.warn("[braintrust] log failed; keeping local eval", err);
    return evalResult;
  }
}

export async function evaluate(modelText: string, task: GoldTask = DEFAULT_TASK): Promise<EvalResult> {
  const local = scoreLocal(task, modelText);
  return maybeLogBraintrust(local, { task_id: task.task_id, source_preview: task.source.slice(0, 160) });
}
