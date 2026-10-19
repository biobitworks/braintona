# STATE — Braintona (handoff)

**Updated:** 2026-07-24 ~14:54 PDT  
**Status:** **SUBMITTED + SEALED** (unsigned FCG; no PI-seal)  
**Deadline:** 15:30 PDT Devpost — met  
**Hosts:** magicPRObox (cockpit) · magicSTUDIObox (compute)  
**Session:** cursor-6430eeef-1426-4566-a6fc-5d688723f05b  
**Branch:** `cursor/braintona-main-app-kg-e2e-cc88` @ `c810b26`+  
**PR:** https://github.com/biobitworks/braintona/pull/3

## Devpost — submitted

| Field | Value |
|---|---|
| Public page | https://devpost.com/software/braintona |
| Submission | `1114676-braintona` — button shows **Project submitted!** |
| Team | **Biobitworks** · Byron P. Lee |
| Project | Braintona |
| Tagline | Fill the handoff gap. Fail closed. |
| License | Apache-2.0 (code) + CC BY-ND 4.0 (docs/media) — `LICENSE.md` |
| Video | https://youtu.be/40_MbcBrLHI |
| Repo | https://github.com/biobitworks/braintona |
| Demo folder | `demo-video/` (CUSTODY.json sealed) |

## Custody seals (local, unsigned)

| Bag | Path |
|---|---|
| HackSprint FCG | `.planning/quick/260724-braintona-hacksprint/FCG_BAG.json` |
| Dual license | `.planning/quick/260724-braintona-hacksprint/DUAL_LICENSE_FCG.json` |
| Submission closeout | `.planning/quick/260724-braintona-hacksprint/SUBMISSION_CLOSEOUT.json` |
| Demo video FCO | `demo-video/CUSTODY.json` |
| Turn ledger | `.planning/conversation_turns/turns.jsonl` |
| Receipts | `.planning/receipts.jsonl` |

`llm_in_science_leaf: false` · `signed: false` · `pi_seal: false` (OPERATOR only)

## Ship spine (done)

1. Fireworks → Braintrust → FCO/MMR → Daytona recompute + tamper fail-closed  
2. Token trace + sponsor PoCs · CodeRabbit observe on PR #3  
3. Two-avatar voice trees + private vault tip · voice star chart  
4. CopilotKit cockpit license LIVE  
5. Dual license + Biobitworks naming throughout  
6. Devpost finalize (rules checked)

## Optional post-submit (non-blocking)

- CodeRabbit Discord Path B in-channel receipt when `the-builders-burrow` invite lands  
- Merge PR #3 when OPERATOR ready  
- PI-seal only with explicit OPERATOR GO  

## Resume (post-hack)

```bash
cd /Users/byron/projects/active/braintona
git checkout cursor/braintona-main-app-kg-e2e-cc88
set -a && source .env && set +a
npm run start   # http://127.0.0.1:8787
open https://devpost.com/software/braintona
open https://youtu.be/40_MbcBrLHI
```
