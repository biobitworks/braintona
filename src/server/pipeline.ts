import { mkdir, appendFile, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { buildReceipt, hashText, verifyReceipt, type CustodyReceipt } from "../lib/receipts.js";
import { evaluate, getDefaultTask } from "./eval.js";
import { fireworksComplete } from "./fireworks.js";
import { daytonaRecompute } from "./daytona.js";

const DATA = path.resolve("data");
const RECEIPTS = path.join(DATA, "receipts.jsonl");

export interface PipelineResult {
  task_id: string;
  source: string;
  model: {
    id: string;
    provider: string;
    text: string;
    tokens_in: number;
    tokens_out: number;
    mock?: boolean;
  };
  eval: Awaited<ReturnType<typeof evaluate>>;
  receipt: CustodyReceipt;
  verify_local: Awaited<ReturnType<typeof verifyReceipt>>;
  daytona?: Awaited<ReturnType<typeof daytonaRecompute>>;
  tamper_receipt?: CustodyReceipt;
  tamper_verify?: Awaited<ReturnType<typeof verifyReceipt>>;
  narrate?: string;
}

async function ensureData() {
  await mkdir(DATA, { recursive: true });
}

export async function runPipeline(opts: {
  source?: string;
  skipDaytona?: boolean;
  plantTamper?: boolean;
} = {}): Promise<PipelineResult> {
  await ensureData();
  const task = getDefaultTask();
  const source = opts.source?.trim() || task.source;

  const fw = await fireworksComplete(source);
  const evalResult = await evaluate(fw.text, { ...task, source });

  const receipt = await buildReceipt({
    operational: {
      model_id: fw.model_id,
      provider: fw.provider,
      ts: new Date().toISOString(),
      tokens_in: fw.tokens_in,
      tokens_out: fw.tokens_out,
      usd_cost_estimate: null,
      eval_score: evalResult.f1,
      eval_pass: evalResult.pass,
    },
    content: {
      prompt_sha256: await hashText(source),
      output_sha256: await hashText(fw.text),
      task_id: task.task_id,
      gold_sha256: await hashText(JSON.stringify(task.gold_claims)),
    },
  });

  const verify_local = await verifyReceipt(receipt);
  await appendFile(RECEIPTS, JSON.stringify(receipt) + "\n");
  await writeFile(path.join(DATA, "latest_receipt.json"), JSON.stringify(receipt, null, 2));

  let daytona;
  if (!opts.skipDaytona) {
    daytona = await daytonaRecompute(receipt);
    if (daytona.sandbox_id) {
      receipt.operational.sandbox_id = daytona.sandbox_id;
    }
  }

  let tamper_receipt: CustodyReceipt | undefined;
  let tamper_verify;
  if (opts.plantTamper !== false) {
    tamper_receipt = await buildReceipt({
      operational: receipt.operational,
      content: {
        prompt_sha256: receipt.content.prompt_sha256,
        output_sha256: receipt.content.output_sha256,
        task_id: receipt.content.task_id,
        gold_sha256: receipt.content.gold_sha256,
      },
      tampered: true,
    });
    // Force wrong recorded root to demonstrate reject-iff-mismatch UI path
    tamper_receipt = {
      ...tamper_receipt,
      custody_root: "0".repeat(64),
      tampered: true,
    };
    tamper_verify = await verifyReceipt(tamper_receipt);
  }

  const narrate = [
    `Braintona eval ${evalResult.pass ? "PASS" : "FAIL"}`,
    `F1 ${(evalResult.f1 * 100).toFixed(0)} percent.`,
    `Local custody ${verify_local.ok ? "verified" : "rejected"}.`,
    daytona
      ? `Daytona sandbox ${daytona.ok ? "recomputed match" : "mismatch or skipped"}.`
      : "Daytona skipped.",
    tamper_verify ? `Planted tamper ${tamper_verify.ok ? "unexpectedly passed" : "correctly rejected"}.` : "",
    "Custody proves provenance, not correctness.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    task_id: task.task_id,
    source,
    model: {
      id: fw.model_id,
      provider: fw.provider,
      text: fw.text,
      tokens_in: fw.tokens_in,
      tokens_out: fw.tokens_out,
      mock: fw.mock,
    },
    eval: evalResult,
    receipt,
    verify_local,
    daytona,
    tamper_receipt,
    tamper_verify,
    narrate,
  };
}

export async function loadLatestReceipt(): Promise<CustodyReceipt | null> {
  try {
    const raw = await readFile(path.join(DATA, "latest_receipt.json"), "utf8");
    return JSON.parse(raw) as CustodyReceipt;
  } catch {
    return null;
  }
}
