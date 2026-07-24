/**
 * Continuous ElevenLabs voice FCG: each voice data file is an FCO leaf;
 * the MMR tip grows with every append (parent tip ‖ new leaf).
 *
 * Claim ceiling: provenance of labeled AI audio bytes + continuous tip —
 * not biometric identity / deepfake score / science truth.
 */
import { mmr } from "./fco.js";
import type { VoiceOriginReceipt } from "./voice_origin.js";

export interface ElevenLabsVoiceFcgLeaf {
  schema: "braintona.elevenlabs_voice_fcg_leaf.v1";
  seq: number;
  filename: string;
  audio_sha256: string;
  audio_bytes: number;
  voice_id: string;
  model_id: string;
  role?: string;
  content_class: "ai";
  leaf_hash: string;
  content_leaf: string;
  fco_root: string;
  parent_mmr_tip: string;
  mmr_tip: string;
  created_at_utc: string;
  llm_in_science_leaf: false;
}

export interface ElevenLabsVoiceFcgState {
  schema: "braintona.elevenlabs_voice_fcg.v1";
  provider: "elevenlabs";
  leaf_count: number;
  mmr_tip: string;
  leaves: string[];
  latest?: ElevenLabsVoiceFcgLeaf;
  claim_ceiling: string;
  llm_in_science_leaf: false;
  updated_at_utc: string;
}

/** Continuous tip: bag previous tip with the new leaf (grows one object at a time). */
export async function extendVoiceMmrTip(
  parentTip: string | null | undefined,
  newLeafHash: string,
): Promise<string> {
  const parent = (parentTip || "").replace(/^sha256:/, "") || "0".repeat(64);
  const leaf = newLeafHash.replace(/^sha256:/, "");
  if (!parentTip || parent === "0".repeat(64)) {
    return leaf;
  }
  return mmr([parent, leaf]);
}

export function leafFromReceipt(input: {
  seq: number;
  filename: string;
  receipt: VoiceOriginReceipt;
  voice_id: string;
  model_id: string;
  role?: string;
  parent_mmr_tip: string;
  mmr_tip: string;
}): ElevenLabsVoiceFcgLeaf {
  const env = input.receipt.envelope;
  return {
    schema: "braintona.elevenlabs_voice_fcg_leaf.v1",
    seq: input.seq,
    filename: input.filename,
    audio_sha256: env.audio.bytes_sha256,
    audio_bytes: env.audio.byte_length,
    voice_id: input.voice_id,
    model_id: input.model_id,
    role: input.role,
    content_class: "ai",
    leaf_hash: input.receipt.leaf_hash,
    content_leaf: input.receipt.content_leaf,
    fco_root: input.receipt.fco_root,
    parent_mmr_tip: input.parent_mmr_tip,
    mmr_tip: input.mmr_tip,
    created_at_utc: env.created_at_utc,
    llm_in_science_leaf: false,
  };
}

export function emptyVoiceFcgState(): ElevenLabsVoiceFcgState {
  return {
    schema: "braintona.elevenlabs_voice_fcg.v1",
    provider: "elevenlabs",
    leaf_count: 0,
    mmr_tip: "0".repeat(64),
    leaves: [],
    claim_ceiling:
      "Continuous ElevenLabs voice FCG — each file is an FCO leaf; tip grows with every append. Provenance only.",
    llm_in_science_leaf: false,
    updated_at_utc: new Date().toISOString(),
  };
}
