# STATE — Braintona (handoff)

**Updated:** 2026-07-24 ~12:59 PDT
**Deadline:** **15:30 PDT** Devpost  
**Hosts:** magicPRObox (cockpit) · magicSTUDIObox (compute)  
**Session:** cursor-6430eeef-1426-4566-a6fc-5d688723f05b  
**Branch:** `cursor/braintona-main-app-kg-e2e-cc88` · PR https://github.com/biobitworks/braintona/pull/3

**Conversation FCO/FCG:** **LIVE** — re-sealed transcript (`312284` B) as private FCO; node `conversation_private` in session graph; turn leaves under `.planning/conversation_turns/`; emit scripts vendored (`scripts/emit_conversation_turn_fco.py`, `emit_mmr_memory_event.py`). Plaintext stays vault-only.

**Presentation vs review:** Technical custody graph on `/` stays for review. Stage/demo figure = **voice star chart** `/demo-voice-star.html` (Cellico/Cloudmer traverse; customer atom gold glint). Lock: `docs/VOICE_STAR_CHART_PRESENTATION.md`.

**Demo record:** **Pro QuickTime** = face+mic · **Studio ⌘⌃⇧5** = app UI · Byron will paste links when done · **agent may edit with ElevenLabs** (clone/TTS OK; label AI; see `DEMO_RECORD_DUAL_HOST.md` §F).

## Pitch / Devpost (live)

| Field | Value |
|---|---|
| Team name | **Biobitworks** |
| Project | Braintona |
| Tagline | Fill the handoff gap. Fail closed. |
| License | **Apache-2.0** (code) + **CC BY-ND 4.0** (docs/media) — `LICENSE.md` |
| Member | Byron P. Lee · byron@biobitworks.com · github / linkedin biobitworks |
| Repo | https://github.com/biobitworks/braintona |
| Draft | https://devpost.com/software/1362706 |
| Master pack | `docs/PITCH_PACK.md` |
| Paste fields | `docs/DEVPOST_SUBMISSION.md` |
| Long form | `docs/DEVPOST_DESCRIPTION.md` |
| 3-min + slides | `docs/PRESENTATION_3MIN.md` · `/pitch.html` |
| Demo video | **TODO** — storyboard in PITCH_PACK §7 |

**Spine:** gaps → fails → value for everyone → live  
**Judging:** Impact / Technical / Creativity / Presentation 25% + sponsor-hop bonus  
**Best Use:** partners may pick from **all** teams — keep Daytona/Braintrust/Fireworks/ElevenLabs demoable

## MVP (what we ship)

1. Fireworks extract → Braintrust score → FCO/MMR seal  
2. Daytona recompute ✓ + tamper ✗  
3. Custody KG + token trace (signed points of contact)  
4. Two-avatar voice trees + private vault tip  
5. Honest claim ceilings in UI  

## Status

| Piece | State |
|---|---|
| Pipeline + Daytona + Braintrust + Fireworks | Working |
| Token trace / PoC signatures | Live |
| Two-avatar ElevenLabs | Wired (Sarah / Matilda) |
| Pitch pack / Devpost paste | **Updated this turn** |
| Demo video | TODO (blocks polished submit) |
| CopilotKit license | **Org exists** — CLI login + `license create --write` still needed; FCO cockpit API/UI scaffolded |
| CodeRabbit Discord Path B | Webhook notify posted (GitHub access ask) · org invite still blocked |

## Resume

```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
fireconnect cursor off
npm run start
# paste docs/DEVPOST_SUBMISSION.md → Devpost
# record <2m video per docs/PITCH_PACK.md §7
# submit before 15:30 PDT
```

**Next (blocking submit):** (1) paste Devpost fields (2) record &lt;2m demo (3) submit  
**Next (optional):** CopilotKit license · CodeRabbit Discord receipt

**CopilotKit:** org exists; run `bash scripts/copilotkit_org_bootstrap.sh` then restart server. Cockpit: `/api/copilotkit/*` + UI panel.

**Component lock:** MMR of actual voice vs AI (`docs/VOICE_HUMAN_AI_MMR_COMPONENT.md`) — twin/handoff voice unit.

**Growth:** voice human/AI MMR builds over time with other vault-private sensor leaves.

**Sponsors:** each touched specially — CodeRabbit **featured** (`docs/SPONSOR_TOUCHES.md`). Seal observe + `@coderabbitai review` on PR #3.

**CopilotKit (phone):** token NOT in `.env` yet. Drop to `.planning/private/copilotkit_license.token` — watcher running (`/tmp/braintona-ck-watch.log`). Do not paste token in chat.
**Server:** http://127.0.0.1:8787 (restarted with sponsor routes).
**CodeRabbit:** PR #3 review green. Path B Discord webhook posted GitHub-access request (receipt `data/coderabbit_discord_path_b_notify_latest.json`). Still need `the-builders-burrow` invite.
**Devpost phone paste:** `docs/DEVPOST_PHONE_PASTE.md`.

**CopilotKit license LIVE** (OPERATOR authorized ingest; token in `.env` only; sha256 banked in receipts). Cockpit seals with `license_present=true`.

**No-video fallback:** http://127.0.0.1:8787/demo-two-turn.html — live two-turn ElevenLabs custody demo.
