/**
 * Live custody-token trace with actor signatures at each FCG point of contact.
 * "Token" = content-leaf custody id. Signatures are local custody hashes
 * (not PI ed25519 seals). llm_in_science_leaf always false.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { canonicalJson, mmr, sha256Hex, PUBLIC_KEY_SHA256 } from "./fco.js";
import type { CustodyReceipt } from "./receipts.js";
import type { CustodyGraph } from "./custody_graph.js";
import type { PrivateConversationPublicPointer } from "./private_conversation.js";

export type TraceHopStatus = "ok" | "reject" | "skip" | "pending" | "pointer";
export type ActorClass = "ai" | "human" | "sponsor_system" | "custody_runtime";

export interface PointOfContact {
  /** FCG bag artifact path this touch binds (if any). */
  fcg_artifact: string | null;
  /** How hashes meet at this touch. */
  combine_op: "leaf_0x00" | "mmr_parent_0x01" | "fcg_bag_bind" | "identity_pointer" | "observe_only";
  /** Running combined signature tip before this touch. */
  prior_combined: string;
  /** Leaf / binding hash contributed by this actor. */
  touch_leaf: string;
  /** Running combined tip after folding this touch (MMR of prior + touch). */
  combined_after: string;
  /** Human-readable contact label for UI. */
  label: string;
}

export interface TouchSignature {
  signature_id: string;
  /** Local custody signature hash — advisory chain link, not PI seal. */
  signature_hash: string;
  actor_class: ActorClass;
  actor_id: string;
  role: string;
  pi_signed: false;
  llm_in_science_leaf: false;
  public_key_sha256_ref: string;
}

export interface TraceHop {
  idx: number;
  sponsor: string;
  surface: string;
  status: TraceHopStatus;
  token_id: string;
  binding: string;
  detail: string;
  in_fcg: boolean;
  fcg_artifact?: string;
  ts?: string;
  signature: TouchSignature;
  point_of_contact: PointOfContact;
}

export interface TokenTrace {
  schema: "braintona.token_trace.v1";
  token_id: string;
  content_leaf: string;
  ops_leaf: string;
  custody_root: string;
  bagged_session_root?: string;
  hops: TraceHop[];
  /** Running tip after all touches — signatures combined in FCG contact order. */
  signature_chain_tip: string;
  actors_seen: Array<{ actor_class: ActorClass; actor_id: string; touches: number }>;
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

async function leafHashPayload(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
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
  const art = (rel: string) => matched.find((a) => a.path.includes(rel))?.path ?? null;
  const artHash = (rel: string) =>
    matched.find((a) => a.path.includes(rel))?.sha256_fco_style.replace(/^sha256:/, "") || null;

  const hops: TraceHop[] = [];
  let combined = "0".repeat(64);
  const created_at_utc = new Date().toISOString();

  const push = async (hop: {
    sponsor: string;
    surface: string;
    status: TraceHopStatus;
    binding: string;
    detail: string;
    in_fcg: boolean;
    fcg_artifact?: string | null;
    ts?: string;
    actor_class: ActorClass;
    actor_id: string;
    role: string;
    combine_op: PointOfContact["combine_op"];
    /** Material this actor contributes at the contact point. */
    contribute: Record<string, unknown>;
    contact_label: string;
  }) => {
    const idx = hops.length + 1;
    const fcg_artifact = hop.fcg_artifact ?? null;
    const touch_leaf = await leafHashPayload({
      token_id,
      idx,
      sponsor: hop.sponsor,
      surface: hop.surface,
      actor_class: hop.actor_class,
      actor_id: hop.actor_id,
      contribute: hop.contribute,
      fcg_artifact,
      fcg_artifact_sha256: fcg_artifact ? artHash(fcg_artifact.split("/").pop() || fcg_artifact) : null,
    });

    const prior_combined = combined;
    const combined_after = await mmr([prior_combined, touch_leaf]);
    combined = combined_after;

    const signature_hash = await leafHashPayload({
      kind: "braintona.touch_signature.v1",
      token_id,
      idx,
      actor_class: hop.actor_class,
      actor_id: hop.actor_id,
      role: hop.role,
      touch_leaf,
      prior_combined,
      combined_after,
      fcg_artifact,
      public_key_sha256_ref: PUBLIC_KEY_SHA256,
      pi_signed: false,
      llm_in_science_leaf: false,
    });

    const signature_id = `SIG-${created_at_utc.replace(/[:.]/g, "")}-${hop.actor_class}-${shortId(signature_hash, 8)}`;

    hops.push({
      idx,
      token_id,
      sponsor: hop.sponsor,
      surface: hop.surface,
      status: hop.status,
      binding: hop.binding,
      detail: hop.detail,
      in_fcg: hop.in_fcg,
      fcg_artifact: fcg_artifact || undefined,
      ts: hop.ts,
      signature: {
        signature_id,
        signature_hash,
        actor_class: hop.actor_class,
        actor_id: hop.actor_id,
        role: hop.role,
        pi_signed: false,
        llm_in_science_leaf: false,
        public_key_sha256_ref: PUBLIC_KEY_SHA256,
      },
      point_of_contact: {
        fcg_artifact,
        combine_op: hop.combine_op,
        prior_combined,
        touch_leaf,
        combined_after,
        label: hop.contact_label,
      },
    });
  };

  await push({
    sponsor: "Fireworks",
    surface: "inference",
    status: input.model.mock ? "skip" : "ok",
    binding: `output_sha256=${shortId(input.receipt.content.output_sha256)} · tokens_out=${input.model.tokens_out}`,
    detail: `${input.model.provider} AI model produced bytes sealed into content leaf`,
    in_fcg: Boolean(art("fireworks")),
    fcg_artifact: art("fireworks"),
    ts: input.receipt.operational.ts,
    actor_class: "ai",
    actor_id: input.model.id,
    role: "generator",
    combine_op: "leaf_0x00",
    contribute: {
      output_sha256: input.receipt.content.output_sha256,
      prompt_sha256: input.receipt.content.prompt_sha256,
      tokens_out: input.model.tokens_out,
    },
    contact_label: "AI → content leaf (FCG: fireworks.ts)",
  });

  await push({
    sponsor: "Braintrust",
    surface: "eval",
    status: input.eval.pass ? "ok" : "reject",
    binding: `eval_pass=${input.eval.pass} · f1=${input.eval.f1.toFixed(3)} · backend=${input.eval.backend}`,
    detail: "Sponsor eval system scores gold task; binds score onto ops leaf",
    in_fcg: Boolean(art("eval")),
    fcg_artifact: art("eval"),
    actor_class: "sponsor_system",
    actor_id: `braintrust:${input.eval.backend}`,
    role: "evaluator",
    combine_op: "fcg_bag_bind",
    contribute: {
      eval_pass: input.eval.pass,
      f1: input.eval.f1,
      ops_leaf,
    },
    contact_label: "Braintrust → ops leaf score (FCG: eval.ts)",
  });

  await push({
    sponsor: "FCO/FCG",
    surface: "seal",
    status: "ok",
    binding: `content_leaf=${token_id} · ops_leaf=${shortId(ops_leaf)}`,
    detail: "Custody runtime seals domain-separated leaves; FCG bag records sealing code",
    in_fcg: true,
    fcg_artifact: art("receipts") || art("fco"),
    actor_class: "custody_runtime",
    actor_id: "braintona.fco.v3",
    role: "sealer",
    combine_op: "leaf_0x00",
    contribute: { content_leaf, ops_leaf },
    contact_label: "Runtime seals leaves into FCG (receipts.ts)",
  });

  await push({
    sponsor: "FCO/FCG",
    surface: "mmr_root",
    status: input.verify_local.ok ? "ok" : "reject",
    binding: `custody_root=${shortId(input.receipt.custody_root)} · recompute=${shortId(input.verify_local.recomputed_root)}`,
    detail: "MMR parent (0x01) combines ops+content; signatures fold at this contact",
    in_fcg: Boolean(art("fco")),
    fcg_artifact: art("fco"),
    actor_class: "custody_runtime",
    actor_id: "braintona.mmr",
    role: "combiner",
    combine_op: "mmr_parent_0x01",
    contribute: {
      custody_root: input.receipt.custody_root,
      recomputed_root: input.verify_local.recomputed_root,
    },
    contact_label: "MMR combine contact (FCG: fco.ts)",
  });

  const d = input.daytona;
  await push({
    sponsor: "Daytona",
    surface: "sandbox_recompute",
    status: d?.skipped ? "skip" : d?.ok ? "ok" : "reject",
    binding: d?.recomputed_root
      ? `sandbox_root=${shortId(d.recomputed_root)} · sandbox=${d.sandbox_id || "n/a"}`
      : `reason=${d?.reason || "no_daytona"}`,
    detail: "Sponsor sandbox independently recomputes custody_root",
    in_fcg: Boolean(art("daytona")),
    fcg_artifact: art("daytona"),
    actor_class: "sponsor_system",
    actor_id: d?.sandbox_id ? `daytona:sandbox:${d.sandbox_id}` : "daytona:sandbox",
    role: "attestor",
    combine_op: "fcg_bag_bind",
    contribute: {
      ok: d?.ok ?? null,
      skipped: d?.skipped ?? null,
      recomputed_root: d?.recomputed_root ?? null,
      reason: d?.reason ?? null,
    },
    contact_label: "Daytona attest contact (FCG: daytona.ts)",
  });

  await push({
    sponsor: "FCO/FCG",
    surface: "tamper_contrast",
    status:
      input.tamper_verify == null ? "pending" : !input.tamper_verify.ok ? "ok" : "reject",
    binding: "planted wrong custody_root → verify must fail",
    detail: !input.tamper_verify?.ok
      ? "Tamper correctly rejected — contrast signature still folds into chain"
      : "Unexpected tamper pass — custody contrast failed",
    in_fcg: true,
    fcg_artifact: art("pipeline"),
    actor_class: "custody_runtime",
    actor_id: "braintona.tamper_contrast",
    role: "contrast",
    combine_op: "mmr_parent_0x01",
    contribute: { tamper_ok: input.tamper_verify?.ok ?? null },
    contact_label: "Tamper contrast contact (FCG: pipeline.ts)",
  });

  if (input.graph?.bagged_session_root) {
    await push({
      sponsor: "FCO/FCG",
      surface: "session_graph",
      status: "ok",
      binding: `bagged_session_root=${shortId(input.graph.bagged_session_root)} · runs=${input.graph.run_count}`,
      detail: "Session graph bags custody roots; token contact stays hash-only",
      in_fcg: Boolean(art("custody_graph")),
      fcg_artifact: art("custody_graph"),
      actor_class: "custody_runtime",
      actor_id: "braintona.session_graph",
      role: "graph_bagger",
      combine_op: "mmr_parent_0x01",
      contribute: {
        bagged_session_root: input.graph.bagged_session_root,
        run_count: input.graph.run_count,
      },
      contact_label: "Session MMR bag contact (FCG: custody_graph.ts)",
    });
  }

  await push({
    sponsor: "WorkOS",
    surface: "identity_optional",
    status: input.workos_enabled ? "pointer" : "skip",
    binding: input.workos_enabled
      ? "AuthKit may bind human operator identity; does not hold Merkle root"
      : "keys absent — identity hop skipped",
    detail: "Human identity pointer — separate from AI generator signature",
    in_fcg: Boolean(art("workos")),
    fcg_artifact: art("workos"),
    actor_class: "human",
    actor_id: "operator:workos_authkit",
    role: "identity",
    combine_op: "identity_pointer",
    contribute: { workos_enabled: Boolean(input.workos_enabled) },
    contact_label: "Human identity contact (FCG: workos.ts)",
  });

  await push({
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
      : "seal via /api/voice-origin to attach human vs AI audio signatures",
    detail: "AI TTS vs human recording get distinct content_class signatures",
    in_fcg: Boolean(art("elevenlabs") || art("voice")),
    fcg_artifact: art("elevenlabs"),
    actor_class: "ai",
    actor_id: "elevenlabs:tts",
    role: "voice_generator",
    combine_op: "leaf_0x00",
    contribute: {
      voice_mmr: input.voice?.mmr_root ?? null,
      mislabel_rejected: input.voice?.mislabel_rejected ?? null,
    },
    contact_label: "AI voice signature contact (FCG: elevenlabs.ts)",
  });

  await push({
    sponsor: "CodeRabbit",
    surface: "discord_path_b",
    status: input.coderabbit_key ? "pointer" : "skip",
    binding: input.coderabbit_key
      ? "API key present — Discord Path B interaction receipt observes repo"
      : "no CODERABBIT_API_KEY",
    detail: "Sponsor observer signature — does not rewrite content leaf",
    in_fcg: false,
    fcg_artifact: null,
    actor_class: "sponsor_system",
    actor_id: "coderabbit:discord_path_b",
    role: "observer",
    combine_op: "observe_only",
    contribute: { key_present: Boolean(input.coderabbit_key) },
    contact_label: "CodeRabbit observe contact (outside FCG bag)",
  });

  await push({
    sponsor: "CopilotKit",
    surface: "operator_ui",
    status: input.copilotkit_license ? "pointer" : "skip",
    binding: input.copilotkit_license ? "license present" : "license missing — UI hop deferred",
    detail: "Operator UI surface; human-facing, custody token unchanged",
    in_fcg: false,
    actor_class: "human",
    actor_id: "operator:copilotkit_ui",
    role: "operator_ui",
    combine_op: "observe_only",
    contribute: { license: Boolean(input.copilotkit_license) },
    contact_label: "Human operator UI contact",
  });

  if (input.privateConversation) {
    const pc = input.privateConversation;
    await push({
      sponsor: "FCO/FCG",
      surface: "private_conversation",
      status: "ok",
      binding: `conv_leaf=${shortId(pc.content_leaf)} · transcript_sha256=${shortId(pc.transcript_sha256)}`,
      detail: "Human+AI Cursor session sealed private; only hashes enter public FCG combine",
      in_fcg: Boolean(art("conversation")),
      fcg_artifact: art("conversation"),
      actor_class: "human",
      actor_id: pc.continuous_session_id,
      role: "conversation_custodian",
      combine_op: "fcg_bag_bind",
      contribute: {
        content_leaf: pc.content_leaf,
        transcript_sha256: pc.transcript_sha256,
        visibility: "private",
      },
      contact_label: "Private conversation contact (hashes only)",
    });
  }

  const actorMap = new Map<string, { actor_class: ActorClass; actor_id: string; touches: number }>();
  for (const h of hops) {
    const key = `${h.signature.actor_class}:${h.signature.actor_id}`;
    const cur = actorMap.get(key) || {
      actor_class: h.signature.actor_class,
      actor_id: h.signature.actor_id,
      touches: 0,
    };
    cur.touches += 1;
    actorMap.set(key, cur);
  }

  return {
    schema: "braintona.token_trace.v1",
    token_id,
    content_leaf,
    ops_leaf,
    custody_root: input.receipt.custody_root,
    bagged_session_root: input.graph?.bagged_session_root,
    hops,
    signature_chain_tip: combined,
    actors_seen: [...actorMap.values()],
    fcg: {
      bag_path: ".planning/quick/260724-braintona-hacksprint/FCG_BAG.json",
      bag_updated_at: fcgBag.updated_at,
      matched_artifacts: matched,
      signed: false,
      llm_in_science_leaf: false,
    },
    claim_ceiling: "token_trace_is_custody_path_not_payment_or_science_truth",
    llm_in_science_leaf: false,
    created_at_utc,
  };
}
