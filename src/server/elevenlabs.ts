export type ElevenLabsNarration = {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  audio_base64?: string;
  content_type?: string;
  voice_id?: string;
  model_id?: string;
};

export async function narrateElevenLabs(
  text: string,
  opts: { voice_id?: string; model_id?: string } = {},
): Promise<ElevenLabsNarration> {
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  if (!key) {
    return { ok: false, skipped: true, reason: "ELEVENLABS_API_KEY missing — redeem Discord coupon on phone" };
  }
  const voice =
    opts.voice_id ||
    process.env.ELEVENLABS_VOICE_ID ||
    process.env.ELEVENLABS_VOICE_ID_AGENT ||
    "XrExE9yKIg1WjnnlVkGX"; // Matilda default
  const model_id = opts.model_id || process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id,
      }),
    });
    if (!res.ok) {
      return {
        ok: false,
        skipped: false,
        reason: `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`,
        voice_id: voice,
        model_id,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      ok: true,
      skipped: false,
      audio_base64: buf.toString("base64"),
      content_type: "audio/mpeg",
      voice_id: voice,
      model_id,
    };
  } catch (err) {
    return {
      ok: false,
      skipped: false,
      reason: err instanceof Error ? err.message : String(err),
      voice_id: voice,
      model_id,
    };
  }
}
