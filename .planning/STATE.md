# STATE — Braintona (handoff)

**Updated:** 2026-07-24 ~11:36 PDT  
**Deadline:** **15:30 PDT** Devpost  
**Hosts:** magicPRObox (cockpit) · magicSTUDIObox (compute)  
**Session:** cursor-6430eeef-1426-4566-a6fc-5d688723f05b  
**Branch:** `cursor/braintona-main-app-kg-e2e-cc88` · PR https://github.com/biobitworks/braintona/pull/3

## Pitch / Devpost (live)

| Field | Value |
|---|---|
| Team name | **Second Machine** |
| Project | Braintona |
| Tagline | Fill the handoff gap. Fail closed. |
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
| CodeRabbit Discord Path B | Queued (optional) |

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
