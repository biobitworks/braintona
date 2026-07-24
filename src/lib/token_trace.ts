/**
 * Live custody-token trace: one content-leaf identity through sponsor hops + FCG.
 * "Token" here = custody identifier (content leaf / derived short id), not a payment token.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CustodyReceipt } from "./receipts.js";
import type { CustodyGraph } from "./custody_graph.js";
import type { PrivateConversationPublicPointer } from "./private_conversation.js";

export type TraceHopStatus = "ok" | "reject" | "skip" | "pending" | "pointer";

export interface TraceHop {
  idx: number;
  sponsor: string;
  surface: string;
  status: TraceHopStatus;
  /** Same custody token id at every hop (short form of content leaf). */
  token_id: string;
  /** How this hop binds or transforms the token (hash refs only). */
  binding: string;
  detail: string;
  in_fcg: boolean;
  fcg_artifact?: string;
  ts?: string;
}

export interface TokenTrace {
  schema: "braintona.token_trace.v1";
  token_id: string;
  content_leaf: string;
  ops_leaf: string;
  custody_root: string;
  bagged_session_root?: string;
  hops: TraceHop[];
  fcg: {
    bag_path: string;
    bag_updated_at?: string;
    matched_artifacts: Array<{ path: string; sha256_fco_style: string }>;
    signed: false;
    llm_in_science_leaf: false;
  };
  claim_ceiling: "token_trace_is_custody_path_not_payment_or_science_truth";
  llm_in_science_leaf: false;
  created_at_utc: string;
}

function shortId(hex: string, n = 12): string {
  return (hex || "").replace(/^sha256:/, "").slice(0, n);
}

async function loadFcgBag(): Promise<{
  updated_at?: string;
  artifacts: Array<{ path: string; sha256_fco_style: string; bytes?: number }>;
}> {
  const bagPath = path.resolve(".planning/quick/260724-braintona-hacksprint/FCG_BAG.json");
  try {
    const bag = JSON.parse(await readFile(bagPath, "utf8")) as {
      updated_at_utc?: string;
      artifacts?: Array<{ path: string; sha256_fco_style: string; bytes?: number }>;
    };
    return { updated_at: bag.updated_at_utc, artifacts: bag.artifacts || [] };
  } catch {
    return { artifacts: [] };
  }
}

/** Prefer custody-critical FCG artifacts that the token path touches. */
function matchFcgArtifacts(
  artifacts: Array<{ path: string; sha256_fco_style: string }>,
): Array<{ path: string; sha256_fco_style: string }> {
  const keys = [
    "src/lib/fco.ts",
    "src/lib/receipts.ts",
    "src/lib/custody_graph.ts",
    "src/lib/token_trace.ts",
    "src/server/pipeline.ts",
    "src/server/fireworks.ts",
    "src/server/eval.ts",
    "src/server/daytona.ts",
    "src/server/elevenlabs.ts",
    "src/server/workos.ts",
    "src/server/conversation_custody.ts",
    ".planning/STATE.md",
  ];
  const out: Array<{ path: string; sha256_fco_style: string }> = [];
  for (const k of keys) {
    const hit = artifacts.find((a) => a.path === k);
    if (hit) out.push({ path: hit.path, sha256_fco_style: hit.sha256_fco_style });
  }
  return out;
}

export async function buildTokenTrace(input: {
  receipt: CustodyReceipt;
  model: { id: string; provider: string; tokens_in: number; tokens_out: number; mock?: boolean };
  eval: { backend: string; pass: boolean; f1: number; precision: number; recall: number };
  verify_local: { ok: boolean; recomputed_root: string };
  daytona?: {
    ok?: boolean;
    skipped?: boolean;
    sandbox_id?: string;
    recomputed_root?: string;
    reason?: string;
  };
  tamper_verify?: { ok: boolean };
  graph?: CustodyGraph;
  privateConversation?: PrivateConversationPublicPointer | null;
  voice?: { mmr_root?: string; mislabel_rejected?: boolean; elevenlabs_ok?: boolean } | null;
  workos_enabled?: boolean;
  coderabbit_key?: boolean;
  copilotkit_license?: boolean;
}): Promise<TokenTrace> {
  const content_leaf = input.receipt.leaves[1];
  const ops_leaf = input.receipt.leaves[0];
  const token_id = shortId(content_leaf);
  const fcgBag = await loadFcgBag();
  const matched = matchFcgArtifacts(fcgBag.artifacts);
  const art = (rel: string) => matched.find((a) => a.path.includes(rel))?.path;

  const hops: TraceHop[] = [];
  const push = (hop: Omit<TraceHop, "idx" | "token_id">) => {
    hops.push({ idx: hops.length + 1, token_id, ...hop });
  };

  push({
    sponsor: "Fireworks",
    surface: "inference",
    status: input.model.mock ? "skip" : "ok",
    binding: `output_sha256=${shortId(input.receipt.content.output_sha256)} · tokens_out=${input.model.tokens_out}`,
    detail: `${input.model.provider}:${shortId(input.model.id, 24)} produced bytes sealed into content leaf`,
    in_fcg: Boolean(art("fireworks")),
    fcg_artifact: art("fireworks"),
    ts: input.receipt.operational.ts,
  });

  push({
    sponsor: "Braintrust",
    surface: "eval",
    status: input.eval.pass ? "ok" : "reject",
    binding: `eval_pass=${input.eval.pass} · f1=${input.eval.f1.toFixed(3)} · backend=${input.eval.backend}`,
    detail: "Gold-task score attached on ops leaf; does not rewrite content leaf",
    in_fcg: Boolean(art("eval")),
    fcg_artifact: art("eval"),
  });

  push({
    sponsor: "FCO/FCG",
    surface: "seal",
    status: "ok",
    binding: `content_leaf=${token_id} · ops_leaf=${shortId(ops_leaf)}`,
    detail: "Domain-separated leaf hashes (0x00) minted; FCG bag records code that seals them",
    in_fcg: true,
    fcg_artifact: art("receipts") || art("fco"),
  });

  push({
    sponsor: "FCO/FCG",
    surface: "mmr_root",
    status: input.verify_local.ok ? "ok" : "reject",
    binding: `custody_root=${shortId(input.receipt.custody_root)} · recompute=${shortId(input.verify_local.recomputed_root)}`,
    detail: "MMR bags ops+content leaves into custody_root; local verify must match",
    in_fcg: Boolean(art("fco")),
    fcg_artifact: art("fco"),
  });

  const d = input.daytona;
  push({
    sponsor: "Daytona",
    surface: "sandbox_recompute",
    status: d?.skipped ? "skip" : d?.ok ? "ok" : "reject",
    binding: d?.recomputed_root
      ? `sandbox_root=${shortId(d.recomputed_root)} · sandbox=${d.sandbox_id || "n/a"}`
      : `reason=${d?.reason || "no_daytona"}`,
    detail: "Independent sandbox recomputes same custody_root from receipt bytes",
    in_fcg: Boolean(art("daytona")),
    fcg_artifact: art("daytona"),
  });

  push({
    sponsor: "FCO/FCG",
    surface: "tamper_contrast",
    status: input.tamper_verify && !input.tamper_verify.ok ? "reject" : "pending",
    binding: "planted wrong custody_root → verify must fail",
    detail: "Same token path proves reject-on-mismatch (custody ≠ correctness)",
    in_fcg: true,
    fcg_artifact: art("pipeline"),
  });

  if (input.graph?.bagged_session_root) {
    push({
      sponsor: "FCO/FCG",
      surface: "session_graph",
      status: "ok",
      binding: `bagged_session_root=${shortId(input.graph.bagged_session_root)} · runs=${input.graph.run_count}`,
      detail: "Token's custody_root joins session MMR mountain; graph node links preserved",
      in_fcg: Boolean(art("custody_graph")),
      fcg_artifact: art("custody_graph"),
    });
  }

  push({
    sponsor: "WorkOS",
    surface: "identity_optional",
    status: input.workos_enabled ? "pointer" : "skip",
    binding: input.workos_enabled
      ? "AuthKit session may bind operator identity; does not hold Merkle root"
      : "keys absent — identity hop skipped",
    detail: "Identity ≠ vault SoT; token remains content_leaf",
    in_fcg: Boolean(art("workos")),
    fcg_artifact: art("workos"),
  });

  push({
    sponsor: "ElevenLabs",
    surface: "voice_origin",
    status: input.voice
      ? input.voice.elevenlabs_ok === false
        ? "skip"
        : input.voice.mislabel_rejected
          ? "ok"
          : "pointer"
      : "pending",
    binding: input.voice?.mmr_root
      ? `voice_mmr=${shortId(input.voice.mmr_root)} · mislabel_rejected=${Boolean(input.voice.mislabel_rejected)}`
      : "seal via /api/voice-origin to attach audio-class leaves",
    detail: "Voice-origin FCO labels human vs AI audio; separate leaves, same custody method",
    in_fcg: Boolean(art("elevenlabs") || art("voice")),
    fcg_artifact: art("elevenlabs"),
  });

  push({
    sponsor: "CodeRabbit",
    surface: "discord_path_b",
    status: input.coderabbit_key ? "pointer" : "skip",
    binding: input.coderabbit_key
      ? "API key present — Discord Path B is interaction receipt (not token rewrite)"
      : "no CODERABBIT_API_KEY",
    detail: "Review/Discord hop observes repo; does not mutate content_leaf",
    in_fcg: false,
  });

  push({
    sponsor: "CopilotKit",
    surface: "operator_ui",
    status: input.copilotkit_license ? "pointer" : "skip",
    binding: input.copilotkit_license ? "license present" : "license missing — UI hop deferred",
    detail: "Operator chat surface; custody token still the content leaf",
    in_fcg: false,
  });

  if (input.privateConversation) {
    const pc = input.privateConversation;
    push({
      sponsor: "FCO/FCG",
      surface: "private_conversation",
      status: "ok",
      binding: `conv_leaf=${shortId(pc.content_leaf)} · transcript_sha256=${shortId(pc.transcript_sha256)}`,
      detail: "Cursor conversation included as private custody object (hashes only in public graph)",
      in_fcg: Boolean(art("conversation")),
      fcg_artifact: art("conversation"),
    });
  }

  return {
    schema: "braintona.token_trace.v1",
    token_id,
    content_leaf,
    ops_leaf,
    custody_root: input.receipt.custody_root,
    bagged_session_root: input.graph?.bagged_session_root,
    hops,
    fcg: {
      bag_path: ".planning/quick/260724-braintona-hacksprint/FCG_BAG.json",
      bag_updated_at: fcgBag.updated_at,
      matched_artifacts: matched,
      signed: false,
      llm_in_science_leaf: false,
    },
    claim_ceiling: "token_trace_is_custody_path_not_payment_or_science_truth",
    llm_in_science_leaf: false,
    created_at_utc: new Date().toISOString(),
  };
}
