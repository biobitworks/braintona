/**
 * Voice-clone FCO: bind an ElevenLabs cloned voice *spec* as a custody object,
 * then seal TTS utterances that use it as content_class=ai leaves under that clone.
 *
 * Claim ceiling: labeled clone registry + byte integrity of AI speech —
 * NOT biometric match to a human, deepfake detection, or science truth.
 */
import { computeFcoRoot, computeLeafHash, mmr, canonicalJson, sha256Hex } from "./fco.js";
import type { VoiceOriginReceipt } from "./voice_origin.js";

export interface VoiceCloneEnvelope {
  fco_version: "v3";
  object_type: "voice_clone";
  content_class: "ai";
  clone: {
    provider: "elevenlabs";
    voice_id: string;
    display_name?: string;
    category?: string;
    model_id_default?: string;
  };
  authorization: {
    author: string;
    release_class: "public-safe" | "operator_vault";
    device_id?: string;
  };
  claim: {
    type: "voice_clone_registry";
    statement: string;
    claim_ceiling: string;
  };
  created_at_utc: string;
  parents: string[];
  llm_in_science_leaf: false;
}

export interface VoiceCloneReceipt {
  schema: "braintona.voice_clone_receipt.v1";
  envelope: VoiceCloneEnvelope;
  content_leaf: string;
  fco_root: string;
  leaf_hash: string;
  node_id: string;
}

async function leaf0(payload: unknown): Promise<string> {
  const canon = canonicalJson(payload);
  const bytes = new TextEncoder().encode(canon);
  const prefixed = new Uint8Array(1 + bytes.length);
  prefixed[0] = 0x00;
  prefixed.set(bytes, 1);
  return sha256Hex(prefixed);
}

export async function sealVoiceClone(input: {
  voice_id: string;
  display_name?: string;
  category?: string;
  model_id_default?: string;
  author?: string;
  device_id?: string;
  parents?: string[];
}): Promise<VoiceCloneReceipt> {
  const created_at_utc = new Date().toISOString();
  const envelope: VoiceCloneEnvelope = {
    fco_version: "v3",
    object_type: "voice_clone",
    content_class: "ai",
    clone: {
      provider: "elevenlabs",
      voice_id: input.voice_id,
      display_name: input.display_name,
      category: input.category || "cloned",
      model_id_default: input.model_id_default || "eleven_multilingual_v2",
    },
    authorization: {
      author: input.author || "byron@biobitworks.com",
      release_class: "public-safe",
      device_id: input.device_id || "magicPRObox",
    },
    claim: {
      type: "voice_clone_registry",
      statement:
        "This FCO registers a labeled AI voice clone (provider voice_id). Utterances that cite this voice_id are sealed as content_class=ai.",
      claim_ceiling:
        "Proves clone registry label + later utterance byte integrity — not biometric speaker ID, not deepfake score, not consent proof beyond operator label.",
    },
    created_at_utc,
    parents: input.parents || [],
    llm_in_science_leaf: false,
  };

  const content_leaf = await leaf0(envelope);
  const fco_root = await computeFcoRoot(content_leaf);
  const node_id = `voice/clone/${input.voice_id}`;
  const leaf_hash = await computeLeafHash(node_id, fco_root);

  return {
    schema: "braintona.voice_clone_receipt.v1",
    envelope,
    content_leaf,
    fco_root,
    leaf_hash,
    node_id,
  };
}

export async function bagCloneWithUtterance(
  clone: VoiceCloneReceipt,
  utterance: VoiceOriginReceipt,
): Promise<{ mmr_root: string; leaves: string[] }> {
  const leaves = [clone.leaf_hash, utterance.leaf_hash];
  return { mmr_root: await mmr(leaves), leaves };
}

export function cloneVoiceIdFromEnv(): string {
  return (
    process.env.ELEVENLABS_VOICE_ID_CLONE ||
    process.env.ELEVENLABS_VOICE_ID ||
    "5niL0Wu395iXN1uc4zne"
  );
}
