/**
 * Demo: show an ElevenLabs voice clone as an FCO + seal one AI utterance under it.
 */
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import {
  bagCloneWithUtterance,
  cloneVoiceIdFromEnv,
  sealVoiceClone,
  type VoiceCloneReceipt,
} from "../lib/voice_clone.js";
import { sealVoiceOrigin, type VoiceOriginReceipt } from "../lib/voice_origin.js";
import { hashText } from "../lib/receipts.js";
import { narrateElevenLabs } from "./elevenlabs.js";

const DATA = path.resolve("data");
const VOICE_DIR = path.resolve("public/assets/voice");
const LEDGER = path.join(DATA, "voice_clone.jsonl");
const LATEST = path.join(DATA, "voice_clone_latest.json");

async function ensureDirs() {
  await mkdir(DATA, { recursive: true });
  await mkdir(VOICE_DIR, { recursive: true });
}

async function lookupVoiceMeta(voiceId: string): Promise<{ name?: string; category?: string }> {
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  if (!key) return {};
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as { voices?: Array<{ voice_id: string; name?: string; category?: string }> };
    const hit = (data.voices || []).find((v) => v.voice_id === voiceId);
    return hit ? { name: hit.name, category: hit.category } : {};
  } catch {
    return {};
  }
}

export interface VoiceCloneDemo {
  schema: "braintona.voice_clone_demo.v1";
  clone: VoiceCloneReceipt;
  utterance: VoiceOriginReceipt | null;
  mmr_root: string;
  leaves: string[];
  audio_path?: string;
  audio_bytes?: number;
  elevenlabs_ok: boolean;
  reason?: string;
  hash_strip: {
    content_class: "ai";
    object_type: "voice_clone" | "voice_origin";
    voice_id: string;
    display_name?: string;
    clone_leaf: string;
    utterance_leaf?: string;
    mmr_root: string;
  };
  claim_ceiling: string;
  llm_in_science_leaf: false;
  note: string;
  created_at_utc: string;
}

export async function runVoiceCloneDemo(opts: {
  voice_id?: string;
  text?: string;
  display_name?: string;
} = {}): Promise<VoiceCloneDemo> {
  await ensureDirs();
  const voice_id = (opts.voice_id || cloneVoiceIdFromEnv()).trim();
  const text =
    opts.text?.trim() ||
    "This is a cloned voice sealed as a Fractal Custody Object. The utterance is labeled AI.";
  const meta = await lookupVoiceMeta(voice_id);
  const display_name =
    opts.display_name ||
    process.env.ELEVENLABS_AVATAR_NAME_CLONE ||
    meta.name ||
    "Byron clone";

  const clone = await sealVoiceClone({
    voice_id,
    display_name,
    category: meta.category || "cloned",
    model_id_default: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
  });

  const audio = await narrateElevenLabs(text, { voice_id });
  let utterance: VoiceOriginReceipt | null = null;
  let audio_path: string | undefined;
  let audio_bytes: number | undefined;
  let elevenlabs_ok = false;
  let reason: string | undefined;

  if (audio.ok && audio.audio_base64) {
    elevenlabs_ok = true;
    const buf = Buffer.from(audio.audio_base64, "base64");
    const fname = `clone_${voice_id.slice(0, 8)}_${Date.now()}.mp3`;
    audio_path = path.join(VOICE_DIR, fname);
    await writeFile(audio_path, buf);
    audio_bytes = buf.length;
    utterance = await sealVoiceOrigin({
      audio: buf,
      content_class: "ai",
      media_type: "audio/mpeg",
      filename: fname,
      generator: {
        kind: "elevenlabs_tts",
        provider: "elevenlabs",
        model_id: audio.model_id || "eleven_multilingual_v2",
        voice_id,
        source_text_sha256: await hashText(text),
      },
      author: `voice_clone:${voice_id}`,
      node_id: `voice/clone/${voice_id}/utt/${Date.now()}`,
      parents: [clone.leaf_hash],
    });
  } else {
    reason = audio.reason || "tts_failed";
  }

  const bag = utterance
    ? await bagCloneWithUtterance(clone, utterance)
    : { mmr_root: clone.leaf_hash, leaves: [clone.leaf_hash] };

  const demo: VoiceCloneDemo = {
    schema: "braintona.voice_clone_demo.v1",
    clone,
    utterance,
    mmr_root: bag.mmr_root,
    leaves: bag.leaves,
    audio_path: audio_path ? `public/assets/voice/${path.basename(audio_path)}` : undefined,
    audio_bytes,
    elevenlabs_ok,
    reason,
    hash_strip: {
      content_class: "ai",
      object_type: utterance ? "voice_origin" : "voice_clone",
      voice_id,
      display_name,
      clone_leaf: clone.leaf_hash.slice(0, 12),
      utterance_leaf: utterance?.leaf_hash.slice(0, 12),
      mmr_root: bag.mmr_root.slice(0, 12),
    },
    claim_ceiling:
      "Voice clone FCO = labeled AI voice registry + AI utterance bytes — not biometric identity.",
    llm_in_science_leaf: false,
    note: elevenlabs_ok
      ? `Clone FCO (${display_name} / ${voice_id}) + AI utterance sealed; MMR bags both leaves.`
      : `Clone FCO sealed; TTS failed (${reason}). Registry leaf still in FCG.`,
    created_at_utc: new Date().toISOString(),
  };

  await appendFile(LEDGER, JSON.stringify({ ...demo, utterance: utterance?.leaf_hash }) + "\n");
  await writeFile(LATEST, JSON.stringify(demo, null, 2));
  return demo;
}
