/**
 * CodeRabbit sponsor observe hop — seals a review/Discord pointer into local custody.
 * Observer does not rewrite content leaves. llm_in_science_leaf always false.
 */
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { canonicalJson, sha256Hex } from "./fco.js";

export interface CodeRabbitObserveReceipt {
  schema: "braintona.coderabbit_observe.v1";
  sponsor: "CodeRabbit";
  surface: "github_pr_bot" | "discord_path_b" | "manual";
  repo: string;
  pr_url?: string;
  pr_number?: number;
  bot_login: string;
  event: string;
  note?: string;
  api_key_present: boolean;
  leaf_hash: string;
  claim_ceiling: "observer_not_pi_seal_not_science_truth";
  llm_in_science_leaf: false;
  sealed_at_utc: string;
}

const DATA = path.resolve("data");
const LATEST = path.join(DATA, "coderabbit_observe_latest.json");
const LEDGER = path.join(DATA, "coderabbit_observe_ledger.jsonl");

async function leafHash(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
}

export async function loadLatestCodeRabbitObserve(): Promise<CodeRabbitObserveReceipt | null> {
  try {
    return JSON.parse(await readFile(LATEST, "utf8")) as CodeRabbitObserveReceipt;
  } catch {
    return null;
  }
}

export async function sealCodeRabbitObserve(input: {
  surface?: CodeRabbitObserveReceipt["surface"];
  pr_url?: string;
  pr_number?: number;
  event?: string;
  note?: string;
  bot_login?: string;
}): Promise<CodeRabbitObserveReceipt> {
  await mkdir(DATA, { recursive: true });
  const sealed_at_utc = new Date().toISOString();
  const body = {
    schema: "braintona.coderabbit_observe.v1" as const,
    sponsor: "CodeRabbit" as const,
    surface: input.surface || "github_pr_bot",
    repo: "biobitworks/braintona",
    pr_url: input.pr_url,
    pr_number: input.pr_number,
    bot_login: input.bot_login || "coderabbitai[bot]",
    event: input.event || "observe",
    note: input.note,
    api_key_present: Boolean(process.env.CODERABBIT_API_KEY?.trim()),
    claim_ceiling: "observer_not_pi_seal_not_science_truth" as const,
    llm_in_science_leaf: false as const,
    sealed_at_utc,
  };
  const leaf_hash = await leafHash(body);
  const receipt: CodeRabbitObserveReceipt = { ...body, leaf_hash };
  await writeFile(LATEST, JSON.stringify(receipt, null, 2));
  await appendFile(LEDGER, JSON.stringify({ leaf_hash, pr_number: receipt.pr_number, surface: receipt.surface, ts: sealed_at_utc }) + "\n");
  return receipt;
}
