# Voice component — MMR of actual vs AI

**Lock (HackSprint + portfolio D17.7b):** the load-bearing **component** is the **MMR of actual voice data versus AI voice**.

## What it is

```text
actual / human voice bytes  →  FCO leaf (content_class=human)
AI / TTS / agent voice bytes →  FCO leaf (content_class=ai)
                              ↓
                    MMR tip = voice component
```

- **Actual** = subject- or human-recorded audio (vault tip may stay private).
- **AI** = synthesized audio with generator metadata (ElevenLabs, etc.).
- **MMR** = bagged tip sponsors/operators can recompute without a vibes classifier.

## Why it’s the component

Pipeline custody (Fireworks → Braintrust → Daytona) proves run provenance.  
The **twin / handoff voice unit** is whether the next person can see **which bytes were human vs AI** under one comparable root.

Two-avatar demo (Sarah customer / Matilda agent) is the live instance: two trees → interaction MMR; customer tip can stay vault-private.

## Claim ceiling

| We claim | We do **not** claim |
|---|---|
| Provenance of recorded voice bytes + explicit labels | Deepfake score / biometric speaker ID |
| Fail-closed verify of the voice MMR tip | Speech content is scientifically true |
| Portable tip across custody graphs | Raw private audio must leave the vault |

`llm_in_science_leaf: false`

## Demo beats

1. Seal voice-origin contrast (`/api/voice-origin`)  
2. Two-avatar call (`/api/demo/two-avatar-call`)  
3. Show interaction MMR + `content_class` on each turn  

## Portfolio link

Cloudmer / Cellico lock: `bioviz-tech` → `PYTHIA_SS_MSM…` + **D17.7b** `VOICE_HUMAN_AI_MMR_COMPONENT_LOCK.json` — Pythia/SS+MSM twin carries this voice MMR as the portable component across sponsors that take models/rules/governance.
