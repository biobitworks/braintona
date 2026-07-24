import { canonicalJson, mmr, sha256Hex } from "./fco.js";

export type ClaimCeiling =
  | "provenance_of_recorded_run_not_correctness"
  | "task_specific_eval_not_universal"
  | "llm_signal_not_custody_proof";

export interface OpsLeaf {
  model_id: string;
  provider: string;
  ts: string;
  tokens_in: number;
  tokens_out: number;
  usd_cost_estimate: number | null;
  sandbox_id?: string | null;
  eval_score?: number | null;
  eval_pass?: boolean | null;
}

export interface ContentLeaf {
  prompt_sha256: string;
  output_sha256: string;
  task_id: string;
  gold_sha256?: string;
}

export interface CustodyReceipt {
  schema: "braintona.custody_receipt.v1";
  operational: OpsLeaf;
  content: ContentLeaf;
  leaves: [string, string];
  custody_root: string;
  claim_ceilings: ClaimCeiling[];
  tampered?: boolean;
  llm_in_science_leaf: false;
}

async function leafHash(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
}

export async function buildReceipt(input: {
  operational: OpsLeaf;
  content: ContentLeaf;
  tampered?: boolean;
}): Promise<CustodyReceipt> {
  const opLeaf = await leafHash(input.operational);
  let contentPayload: ContentLeaf = input.content;
  if (input.tampered) {
    contentPayload = {
      ...input.content,
      output_sha256: "deadbeef" + input.content.output_sha256.slice(8),
    };
  }
  const contentLeaf = await leafHash(contentPayload);
  const custody_root = await mmr([opLeaf, contentLeaf]);
  return {
    schema: "braintona.custody_receipt.v1",
    operational: input.operational,
    content: contentPayload,
    leaves: [opLeaf, contentLeaf],
    custody_root,
    claim_ceilings: [
      "provenance_of_recorded_run_not_correctness",
      "task_specific_eval_not_universal",
      "llm_signal_not_custody_proof",
    ],
    tampered: Boolean(input.tampered),
    llm_in_science_leaf: false,
  };
}

export async function verifyReceipt(receipt: CustodyReceipt): Promise<{
  ok: boolean;
  recomputed_root: string;
  recorded_root: string;
}> {
  const opLeaf = await leafHash(receipt.operational);
  const contentLeaf = await leafHash(receipt.content);
  const recomputed_root = await mmr([opLeaf, contentLeaf]);
  return {
    ok: recomputed_root === receipt.custody_root && opLeaf === receipt.leaves[0] && contentLeaf === receipt.leaves[1],
    recomputed_root,
    recorded_root: receipt.custody_root,
  };
}

export async function hashText(text: string): Promise<string> {
  return sha256Hex(text);
}
