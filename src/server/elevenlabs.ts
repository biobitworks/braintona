export async function narrateElevenLabs(text: string): Promise<{
  ok: boolean;
  skipped: boolean;
  reason?: string;
  audio_base64?: string;
  content_type?: string;
}> {
  const key = process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY;
  if (!key) {
    return { ok: false, skipped: true, reason: "ELEVENLABS_API_KEY missing — redeem Discord coupon on phone" };
  }
  const voice = process.env.ELEVENLABS_VOICE_ID || "RXIcu418WGXrG1TSbJx2";
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
        model_id: "eleven_monolingual_v1",
      }),
    });
    if (!res.ok) {
      return { ok: false, skipped: false, reason: `ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      ok: true,
      skipped: false,
      audio_base64: buf.toString("base64"),
      content_type: "audio/mpeg",
    };
  } catch (err) {
    return { ok: false, skipped: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
