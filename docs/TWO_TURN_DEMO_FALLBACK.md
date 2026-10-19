# Two-turn demo — Devpost video fallback

If you **skip the &lt;2m video**, use this live two-turn ElevenLabs custody demo for judges.

## Open

```text
http://127.0.0.1:8787/demo-two-turn.html
```

Or main app → **Two-avatar call demo**.

## What it proves (≈45–60s)

1. **Turn 1** — customer avatar TTS → FCO leaf (Tree A)  
2. **Turn 2** — agent avatar TTS → FCO leaf (Tree B)  
3. **Interaction MMR** bags both · customer tip in vault  
4. Say: “Actual vs AI voice MMR is the component — here both are honest AI stand-ins; labels + hashes, not deepfakes.”

## Your ElevenLabs avatar

Put your voice/avatar ids in `.env` (restart server):

```bash
ELEVENLABS_VOICE_ID_CUSTOMER=<your_customer_or_avatar_voice_id>
ELEVENLABS_VOICE_ID_AGENT=<your_agent_voice_id>
ELEVENLABS_AVATAR_NAME_CUSTOMER=YourAvatar
ELEVENLABS_AVATAR_NAME_AGENT=Agent
```

Or POST overrides:

```bash
curl -sS -X POST http://127.0.0.1:8787/api/demo/two-avatar-call \
  -H 'content-type: application/json' \
  -d '{"customer_voice_id":"…","agent_voice_id":"…","customer_name":"MyAvatar","agent_name":"Agent"}'
```

## CLI

```bash
npm run demo:two-avatar
```

## Claim ceiling

Avatar TTS = `content_class=ai` stand-in. Provenance of recorded bytes — not biometrics / science truth.
