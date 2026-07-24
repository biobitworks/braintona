import { mkdir, readdir, readFile, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { hashText } from "../lib/receipts.js";
import {
  buildVoiceOriginGraph,
  sealVoiceOrigin,
  verifyVoiceOriginGraph,
  type VoiceOriginReceipt,
} from "../lib/voice_origin.js";
import { narrateElevenLabs } from "./elevenlabs.js";

const DATA = path.resolve("data");
const VOICE_DIR = path.resolve("public/assets/voice");
const LEDGER = path.join(DATA, "voice_origin.jsonl");
const LATEST = path.join(DATA, "voice_origin_latest.json");

async function ensureDirs() {
  await mkdir(DATA, { recursive: true });
  await mkdir(VOICE_DIR, { recursive: true });
}

function mediaTypeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a") return "audio/mp4";
  if (ext === ".ogg") return "audio/ogg";
  if (ext === ".webm") return "audio/webm";
  return "audio/mpeg";
}

/** Seal any human voice files dropped into public/assets/voice/ */
export async function sealLocalHumanVoices(): Promise<VoiceOriginReceipt[]> {
  await ensureDirs();
  const files = (await readdir(VOICE_DIR)).filter((f) =>
    /\.(mp3|wav|m4a|ogg|webm)$/i.test(f),
  );
  const out: VoiceOriginReceipt[] = [];
  for (const f of files) {
    const buf = await readFile(path.join(VOICE_DIR, f));
    const receipt = await sealVoiceOrigin({
      audio: buf,
      content_class: "human",
      media_type: mediaTypeFor(f),
      filename: f,
      generator: { kind: "human_recording", provider: "local_file" },
      node_id: `voice/human/${f}`,
    });
    out.push(receipt);
    await appendFile(LEDGER, JSON.stringify(receipt) + "\n");
  }
  return out;
}

/** Seal AI narration bytes (ElevenLabs or browser fallback placeholder). */
export async function sealAiNarration(text: string): Promise<{
  receipt: VoiceOriginReceipt | null;
  audio: Awaited<ReturnType<typeof narrateElevenLabs>>;
}> {
  await ensureDirs();
  const audio = await narrateElevenLabs(text);
  if (!audio.ok || !audio.audio_base64) {
    // Seal a deterministic placeholder so the FCG still shows an AI leaf even when API blocked.
    const placeholder = Buffer.from(`braintona-ai-narrate-pending:${text}`, "utf8");
    const receipt = await sealVoiceOrigin({
      audio: placeholder,
      content_class: "ai",
      media_type: "text/plain",
      filename: "ai_narrate_pending.txt",
      generator: {
        kind: audio.skipped ? "browser_tts" : "other_ai",
        provider: "elevenlabs",
        model_id: "pending_or_blocked",
        source_text_sha256: await hashText(text),
      },
      node_id: `voice/ai/pending-${Date.now()}`,
    });
    await appendFile(LEDGER, JSON.stringify(receipt) + "\n");
    return { receipt, audio };
  }

  const buf = Buffer.from(audio.audio_base64, "base64");
  const receipt = await sealVoiceOrigin({
    audio: buf,
    content_class: "ai",
    media_type: audio.content_type || "audio/mpeg",
    filename: `ai_narrate_${Date.now()}.mp3`,
    generator: {
      kind: "elevenlabs_tts",
      provider: "elevenlabs",
      model_id: "eleven_monolingual_v1",
      voice_id: process.env.ELEVENLABS_VOICE_ID || "RXIcu418WGXrG1TSbJx2",
      source_text_sha256: await hashText(text),
    },
    node_id: `voice/ai/${Date.now()}`,
  });
  await appendFile(LEDGER, JSON.stringify(receipt) + "\n");
  return { receipt, audio };
}

export async function buildContrastDemo(narrateText: string) {
  const human = await sealLocalHumanVoices();
  const { receipt: ai, audio } = await sealAiNarration(narrateText);
  const receipts = [...human, ...(ai ? [ai] : [])];
  const graph = await buildVoiceOriginGraph(receipts);
  const verify = await verifyVoiceOriginGraph(receipts, graph.mmr_root);

  // Planted mislabel: flip AI leaf class in a copy → must fail verify
  let mislabel_rejected = false;
  if (ai) {
    const bad = structuredClone(ai) as VoiceOriginReceipt;
    bad.envelope.content_class = "human";
    bad.envelope.claim.statement = "TAMPERED: mislabeled AI as human";
    const badGraph = await buildVoiceOriginGraph([...human, bad]);
    // Compare against honest root — should differ
    mislabel_rejected = badGraph.mmr_root !== graph.mmr_root;
  }

  const bundle = {
    human_count: human.length,
    ai_count: ai ? 1 : 0,
    graph,
    verify,
    mislabel_rejected,
    elevenlabs: {
      ok: audio.ok,
      skipped: audio.skipped,
      reason: audio.reason,
    },
    method_doi: "https://doi.org/10.5281/zenodo.21210575",
    note:
      human.length === 0
        ? "Drop human .mp3/.wav into public/assets/voice/ to seal human-origin leaves."
        : "Human vs AI voice-origin leaves sealed into one FCG MMR.",
  };

  await writeFile(LATEST, JSON.stringify(bundle, null, 2));
  return { ...bundle, audio_base64: audio.audio_base64, content_type: audio.content_type };
}
