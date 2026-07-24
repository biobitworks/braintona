# Sponsor + skill review → rebuild decision

**Locked:** 2026-07-24  
**Product:** Braintona  
**Lineage:** Glasswork (Butterbase) · BioCustody / voiceworks (Sauna.ai) · phonebio · Kylon BioBridge · FCO Zenodo DOI

## What Sauna already proved (keep)

Sauna / BioCustody / voiceworks showed:

- ElevenLabs TTS via proxy (`/api/tts`) with explicit `voice_id` + `model`
- Conversation turns sealed as FCOs with **human vs agent** roles
- Live merkle root so judges see **when** a leaf was added
- Accessibility narration is still a **custody object**, not just audio

**Voice hash pattern (target UI):** for every clip show  
`content_class` · `audio_sha256[:12]` · `generator` · `voice_id` · `model` · `leaf_hash[:12]` · time  
so a human mic/file leaf and an ElevenLabs leaf are visually distinct and recompute-verifiable.

## Sponsor options (skills / tools available)

| Sponsor | Local skills / tools | Prize fit | Options we considered | **Decision** |
|---|---|---|---|---|
| **Daytona** | SDK CLI; sandbox `codeRun` | Best Use $1k + main | Full app in sandbox vs **attest-only recompute** | **KEEP attest-only** — independent MMR recompute + tamper red is the cleanest Daytona story |
| **Braintrust** | SDK logger; wizard project | Best Use $500 | Full experiments UI vs **eval logger on gold task** | **KEEP eval logger** — already live on `braintona-hacksprint` |
| **Fireworks** | API + FireConnect Cursor | Best Use $500 | FireConnect for all Cursor chats vs **demo-only inference** | **Demo-only** — credits limited; `fireconnect cursor off` for build; pipeline uses `glm-5p1` sparingly |
| **ElevenLabs** | API; Sauna/BioCustody TTS patterns; voice-origin FCO | Best Use (Scale tier) | TTS-only vs **voice-hash human/AI custody** (+ avatar/video if quota) | **PRIMARY BEST-USE WEDGE** — Sauna-style voice hash strip + seal AI TTS + human files |
| **WorkOS** | Cursor WorkOS plugin + AuthKit Node skill | Participation domain | Gate whole app vs **optional local AuthKit** | **KEEP optional AuthKit** — migrate URL when domain lands |
| **CodeRabbit** | Discord bot challenge + API key in `.env` | Best Use $1k | Full bot MVP vs **public repo + Discord connect receipt** | **Path B** — wire bot when at venue; key stored; don’t block MVP |
| **CopilotKit** | `npx copilotkit license` | Best Use $500 | Full chat cockpit vs skip | **DEFER** until license — not on critical path |

Portfolio skills that apply (not sponsor-specific): `gsd-*` planning, Ollarma custody heartbeats, FCO turn emit, Watchtower receipts — keep for ops, not pitch.

## Rebuild decision (locked MVP)

```text
ONE DEMO LOOP (≤60s on stage):

1. Run pipeline → Fireworks answer → Braintrust PASS
2. Local FCO root ✓ → Daytona sandbox recompute ✓ → tamper ✗
3. Seal voice-origin:
     HUMAN leaf  (local mic/file)  → hash strip
     AI leaf     (ElevenLabs TTS) → hash strip
4. Mislabel attempt → MMR mismatch (reject)
5. Optional WorkOS sign-in chip (identity only)
```

**Tagline:** Audit every agent byte — and every voice leaf.  
**Ceiling:** Labels + hashes prove origin class and byte integrity — not biometrics / deepfake score / science truth.

## What changes vs prior Braintona cut

1. **Elevate ElevenLabs** from “optional Speak” to **visible voice-hash panel** (Sauna pattern).  
2. Default voice IDs from BioCustody/Sauna: `ys3XeJJA4ArWMhRpcX1D` / fallbacks.  
3. Fix API key permissions (need TTS-capable key; recreate if `missing_permissions`).  
4. Drop human sample into `public/assets/voice/` for contrast.  
5. Keep Daytona/Braintrust/Fireworks as the custody spine.  
6. WorkOS optional; CopilotKit/CodeRabbit bonus after MVP video.

## Non-goals (today)

- Full ElevenLabs image/video pipeline unless API quota clearly allows (can bake avatar stills offline for Devpost video)
- Gating demo behind WorkOS
- FireConnect burning credits during build

## PhoneBio tertiary goal (PB-G3 — 2026-07-24T17:17:32Z)

Lineage note: PhoneBio’s **tertiary** goal is to use **local sensors** to estimate **how many people** to help with **voice distinguishing** (presence-class only). Owner: `phonebio/.planning/PHONEBIO_TERTIARY_SENSOR_PEOPLE_VOICE_GOAL.md`.
