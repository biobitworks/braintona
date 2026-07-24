/**
 * Two-avatar ElevenLabs demo: customer caller vs voice agent.
 * Both are TTS avatars (honest content_class=ai) on two FCO trees under one interaction.
 * Customer tree tip is also written to the operator vault as the private Merkle root pattern.
 */
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { mmr } from "../lib/fco.js";
import { hashText } from "../lib/receipts.js";
import { sealVoiceOrigin, type VoiceOriginReceipt } from "../lib/voice_origin.js";
import { narrateElevenLabs } from "./elevenlabs.js";

const DATA = path.resolve("data");
const VOICE_DIR = path.resolve("public/assets/voice");
const PRIVATE = path.resolve(".planning/private");
const LEDGER = path.join(DATA, "two_avatar_call.jsonl");
const LATEST = path.join(DATA, "two_avatar_call_latest.json");
const VAULT = path.join(PRIVATE, "customer_voice_vault_latest.json");

/** Sarah — customer avatar */
export const CUSTOMER_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID_CUSTOMER || "EXAVITQu4vr4xnSDxMaL";
/** Matilda — agent avatar */
export const AGENT_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID_AGENT || "XrExE9yKIg1WjnnlVkGX";

const DEFAULT_SCRIPT = {
  customer:
    "Hi — I need to hand off this lab run. Can you confirm the custody root matches before I leave?",
  agent:
    "I verified the receipt. Local custody matches. Daytona recompute is next. Custody proves provenance, not correctness.",
};

export interface AvatarTurn {
  role: "customer" | "agent";
  avatar_name: string;
  voice_id: string;
  model_id: string;
  text: string;
  audio_path: string;
  audio_bytes: number;
  audio_sha256: string;
  receipt: VoiceOriginReceipt;
  tree: "A_customer" | "B_agent";
}

export interface TwoAvatarCallDemo {
  schema: "braintona.two_avatar_call.v1";
  interaction_id: string;
  tree_a_tip: string;
  tree_b_tip: string;
  interaction_mmr_root: string;
  customer_vault_root: string;
  turns: AvatarTurn[];
  elevenlabs: { customer_ok: boolean; agent_ok: boolean; reasons: string[] };
  claim_ceiling: "avatar_tts_is_ai_standin_not_real_human_mic";
  llm_in_science_leaf: false;
  note: string;
  created_at_utc: string;
}

async function ensureDirs() {
  await mkdir(DATA, { recursive: true });
  await mkdir(VOICE_DIR, { recursive: true });
  await mkdir(PRIVATE, { recursive: true });
}

async function synthAndSeal(opts: {
  role: "customer" | "agent";
  avatar_name: string;
  voice_id: string;
  text: string;
  tree: "A_customer" | "B_agent";
  node_prefix: string;
}): Promise<{ turn: AvatarTurn | null; ok: boolean; reason?: string }> {
  const audio = await narrateElevenLabs(opts.text, { voice_id: opts.voice_id });
  if (!audio.ok || !audio.audio_base64) {
    return { turn: null, ok: false, reason: audio.reason || "tts_failed" };
  }
  const buf = Buffer.from(audio.audio_base64, "base64");
  const fname = `${opts.role}_${Date.now()}.mp3`;
  const audio_path = path.join(VOICE_DIR, fname);
  await writeFile(audio_path, buf);
  const { sha256Hex } = await import("../lib/fco.js");
  const byteSha = await sha256Hex(new Uint8Array(buf));

  const receipt = await sealVoiceOrigin({
    audio: buf,
    content_class: "ai", // honest: both avatars are ElevenLabs TTS stand-ins
    media_type: "audio/mpeg",
    filename: fname,
    generator: {
      kind: "elevenlabs_tts",
      provider: "elevenlabs",
      model_id: audio.model_id || "eleven_multilingual_v2",
      voice_id: audio.voice_id || opts.voice_id,
      source_text_sha256: await hashText(opts.text),
    },
    author: opts.role === "customer" ? "avatar:customer" : "avatar:agent",
    node_id: `${opts.node_prefix}/${byteSha.slice(0, 12)}`,
  });

  // Annotate role on envelope claim for demo readability (does not change leaf — already sealed)
  // Keep sealed receipt as-is; role lives on the turn object.

  return {
    ok: true,
    turn: {
      role: opts.role,
      avatar_name: opts.avatar_name,
      voice_id: audio.voice_id || opts.voice_id,
      model_id: audio.model_id || "eleven_multilingual_v2",
      text: opts.text,
      audio_path: `public/assets/voice/${fname}`,
      audio_bytes: buf.byteLength,
      audio_sha256: byteSha,
      receipt,
      tree: opts.tree,
    },
  };
}

export async function runTwoAvatarCallDemo(opts: {
  customer_text?: string;
  agent_text?: string;
} = {}): Promise<TwoAvatarCallDemo> {
  await ensureDirs();
  const reasons: string[] = [];
  const customer_text = opts.customer_text?.trim() || DEFAULT_SCRIPT.customer;
  const agent_text = opts.agent_text?.trim() || DEFAULT_SCRIPT.agent;

  const c = await synthAndSeal({
    role: "customer",
    avatar_name: "Sarah",
    voice_id: CUSTOMER_VOICE_ID,
    text: customer_text,
    tree: "A_customer",
    node_prefix: "voice/avatar/customer",
  });
  if (!c.ok) reasons.push(`customer: ${c.reason}`);

  const a = await synthAndSeal({
    role: "agent",
    avatar_name: "Matilda",
    voice_id: AGENT_VOICE_ID,
    text: agent_text,
    tree: "B_agent",
    node_prefix: "voice/avatar/agent",
  });
  if (!a.ok) reasons.push(`agent: ${a.reason}`);

  const turns = [c.turn, a.turn].filter(Boolean) as AvatarTurn[];
  const tree_a_tip = c.turn?.receipt.leaf_hash || "0".repeat(64);
  const tree_b_tip = a.turn?.receipt.leaf_hash || "0".repeat(64);
  const interaction_mmr_root = await mmr([tree_a_tip, tree_b_tip]);
  const interaction_id = `call-${interaction_mmr_root.slice(0, 12)}`;

  // Private vault: customer tree tip = private Merkle root pattern (demo stand-in for real human mic)
  const vault = {
    schema: "braintona.operator_vault.customer_voice.v1",
    visibility: "private",
    role: "customer_avatar_tree_a",
    interaction_id,
    merkle_root: tree_a_tip,
    fco_root: c.turn?.receipt.fco_root,
    audio_sha256: c.turn?.audio_sha256,
    voice_id: CUSTOMER_VOICE_ID,
    note: "Private Merkle root for Tree A (customer). Real human mic would replace TTS stand-in; root stays in vault.",
    llm_in_science_leaf: false,
    sealed_at_utc: new Date().toISOString(),
  };
  await writeFile(VAULT, JSON.stringify(vault, null, 2));

  const demo: TwoAvatarCallDemo = {
    schema: "braintona.two_avatar_call.v1",
    interaction_id,
    tree_a_tip,
    tree_b_tip,
    interaction_mmr_root,
    customer_vault_root: tree_a_tip,
    turns,
    elevenlabs: {
      customer_ok: Boolean(c.ok),
      agent_ok: Boolean(a.ok),
      reasons,
    },
    claim_ceiling: "avatar_tts_is_ai_standin_not_real_human_mic",
    llm_in_science_leaf: false,
    note:
      "Tree A = customer avatar (Sarah). Tree B = agent avatar (Matilda). Interaction MMR combines both. Customer root stored in .planning/private/ vault.",
    created_at_utc: new Date().toISOString(),
  };

  await appendFile(LEDGER, JSON.stringify({ interaction_id, interaction_mmr_root, ts: demo.created_at_utc }) + "\n");
  // Public latest without huge base64
  await writeFile(LATEST, JSON.stringify(demo, null, 2));
  return demo;
}
