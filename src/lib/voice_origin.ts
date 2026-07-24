/**
 * Voice-origin Fractal Custody Objects (FCO v3 / FCG MMR).
 *
 * Distinguishes human-recorded vs AI-synthesized audio by binding:
 *   - exact audio bytes (sha256)
 *   - explicit content_class ∈ {human, ai}
 *   - generator provenance (mic/file vs elevenlabs model/voice)
 *
 * Claim ceiling: proves labeled origin + byte integrity, NOT speaker identity
 * biometrics, deepfake detection, or scientific truth.
 *
 * Method: Lee, B. (2026). Fractal Custody Objects. Zenodo.
 * https://doi.org/10.5281/zenodo.21210575
 */
import { createHash } from "node:crypto";
import { canonicalJson, mmr, sha256Hex } from "./fco.js";

export type VoiceContentClass = "human" | "ai";

export interface VoiceOriginEnvelope {
  fco_version: "v3";
  object_type: "voice_origin";
  content_class: VoiceContentClass;
  audio: {
    bytes_sha256: string;
    byte_length: number;
    media_type: string;
    filename?: string;
  };
  generator: {
    kind: "human_recording" | "elevenlabs_tts" | "browser_tts" | "other_ai";
    provider?: string;
    model_id?: string;
    voice_id?: string;
    source_text_sha256?: string;
  };
  authorization: {
    author: string;
    release_class: string;
    device_id?: string;
  };
  claim: {
    type: "voice_origin_label";
    statement: string;
    claim_ceiling: string;
  };
  created_at_utc: string;
  parents: string[];
  llm_in_science_leaf: false;
}

export interface VoiceOriginReceipt {
  schema: "braintona.voice_origin_receipt.v1";
  envelope: VoiceOriginEnvelope;
  content_leaf: string;
  fco_root: string;
  leaf_hash: string;
  node_id: string;
}

export interface VoiceOriginGraph {
  schema: "braintona.voice_origin_fcg.v1";
  leaves: string[];
  mmr_root: string;
  nodes: Array<{
    node_id: string;
    content_class: VoiceContentClass;
    leaf_hash: string;
    audio_sha256: string;
  }>;
  claim_ceiling: string;
  method_doi: string;
}

function sha256Buf(buf: Buffer | Uint8Array): string {
  return createHash("sha256").update(buf).digest("hex");
}

async function leaf0(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
}

/** File/root style used in BioCustody: sha256(0x00 || content_leaf || 0x00 || pubkey). */
async function computeFcoRoot(contentLeaf: string, publicKeySha256: string): Promise<string> {
  const enc = new TextEncoder();
  const a = enc.encode(contentLeaf);
  const b = enc.encode(publicKeySha256);
  const concat = new Uint8Array(1 + a.length + 1 + b.length);
  concat[0] = 0x00;
  concat.set(a, 1);
  concat[1 + a.length] = 0x00;
  concat.set(b, 1 + a.length + 1);
  return sha256Hex(concat);
}

async function computeTurnLeaf(nodeId: string, fcoRoot: string): Promise<string> {
  const data = new TextEncoder().encode(`${nodeId}|${fcoRoot}`);
  const concat = new Uint8Array(1 + data.length);
  concat[0] = 0x00;
  concat.set(data, 1);
  return sha256Hex(concat);
}

export const DEFAULT_PUBKEY =
  "903fec780c8219cccec286d845d3f58da70fa3b2969a8ad4a77bfc58fa1a8c35";

export async function sealVoiceOrigin(input: {
  audio: Buffer | Uint8Array;
  content_class: VoiceContentClass;
  media_type?: string;
  filename?: string;
  generator: VoiceOriginEnvelope["generator"];
  author?: string;
  device_id?: string;
  node_id?: string;
  parents?: string[];
  public_key_sha256?: string;
}): Promise<VoiceOriginReceipt> {
  const buf = Buffer.from(input.audio);
  const audioSha = sha256Buf(buf);
  const created_at_utc = new Date().toISOString();
  const content_class = input.content_class;

  const envelope: VoiceOriginEnvelope = {
    fco_version: "v3",
    object_type: "voice_origin",
    content_class,
    audio: {
      bytes_sha256: audioSha,
      byte_length: buf.length,
      media_type: input.media_type || "audio/mpeg",
      filename: input.filename,
    },
    generator: input.generator,
    authorization: {
      author: input.author || "byron@biobitworks.com",
      release_class: "public-safe",
      device_id: input.device_id || "magicPRObox",
    },
    claim: {
      type: "voice_origin_label",
      statement:
        content_class === "human"
          ? "Audio bytes are labeled human-origin (recording/file), bound by sha256."
          : "Audio bytes are labeled AI-origin (synthesized), bound by sha256 + generator metadata.",
      claim_ceiling:
        "Proves labeled origin class + byte integrity only — not biometric speaker ID, deepfake detector score, or semantic truth.",
    },
    created_at_utc,
    parents: input.parents || [],
    llm_in_science_leaf: false,
  };

  const content_leaf = await leaf0(envelope);
  const fco_root = await computeFcoRoot(content_leaf, input.public_key_sha256 || DEFAULT_PUBKEY);
  const node_id = input.node_id || `voice/${content_class}/${audioSha.slice(0, 12)}`;
  const leaf_hash = await computeTurnLeaf(node_id, fco_root);

  return {
    schema: "braintona.voice_origin_receipt.v1",
    envelope,
    content_leaf,
    fco_root,
    leaf_hash,
    node_id,
  };
}

export async function buildVoiceOriginGraph(receipts: VoiceOriginReceipt[]): Promise<VoiceOriginGraph> {
  const leaves = receipts.map((r) => r.leaf_hash);
  const mmr_root = await mmr(leaves);
  return {
    schema: "braintona.voice_origin_fcg.v1",
    leaves,
    mmr_root,
    nodes: receipts.map((r) => ({
      node_id: r.node_id,
      content_class: r.envelope.content_class,
      leaf_hash: r.leaf_hash,
      audio_sha256: r.envelope.audio.bytes_sha256,
    })),
    claim_ceiling:
      "FCG MMR proves ordered set of labeled voice-origin leaves; mismatch rejects. Does not prove speaker identity.",
    method_doi: "https://doi.org/10.5281/zenodo.21210575",
  };
}

/** Recompute leaf hashes from envelopes and compare to recorded graph root. */
export async function verifyVoiceOriginGraph(
  receipts: VoiceOriginReceipt[],
  recordedRoot: string,
): Promise<{ ok: boolean; recomputed_root: string; recorded_root: string }> {
  const recomputed = await buildVoiceOriginGraph(receipts);
  return {
    ok: recomputed.mmr_root === recordedRoot,
    recomputed_root: recomputed.mmr_root,
    recorded_root: recordedRoot,
  };
}

export function classifyContrast(humanCount: number, aiCount: number): string {
  return `${humanCount} human-origin leaf(s), ${aiCount} AI-origin leaf(s) — labels are explicit FCO fields, not inferred.`;
}
