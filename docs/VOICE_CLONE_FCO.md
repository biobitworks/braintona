# Voice clone as FCO

**Demo:** `POST /api/demo/voice-clone` · UI button **Seal voice clone FCO**

## What seals

1. **`voice_clone` FCO** — registry leaf for an ElevenLabs `voice_id` (e.g. Byron clone `5niL0Wu395iXN1uc4zne`), `content_class=ai`.
2. **Utterance `voice_origin` FCO** — TTS bytes from that clone, `content_class=ai`, `generator.voice_id` bound, parent = clone leaf.
3. **MMR** — bags clone leaf + utterance leaf.

## Env

```bash
ELEVENLABS_VOICE_ID_CLONE=5niL0Wu395iXN1uc4zne
ELEVENLABS_AVATAR_NAME_CLONE=Byron clone
```

## Claim ceiling

Labeled AI voice registry + AI utterance byte integrity. **Not** biometric match to a human, deepfake score, or consent beyond operator label.

## UI

Hash strip shows: `AI clone` · `voice_id` · `clone_leaf` · `utt_leaf` · `mmr` + audio player.
