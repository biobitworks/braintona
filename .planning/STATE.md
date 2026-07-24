# STATE — Braintona (handoff)

**Updated:** 2026-07-24 ~10:31 PDT  
**Deadline:** 15:30 PDT Devpost  
**Hosts:** magicPRObox (cockpit) · magicSTUDIObox (compute)  
**Session:** cursor-6430eeef-1426-4566-a6fc-5d688723f05b

## MVP (what we ship)

**Braintona** — custody agent for AI handoff:

1. **Fireworks** extracts claims (temp 0)  
2. **Braintrust** scores vs gold (pass/fail)  
3. **FCO/MMR** seals ops+content receipt  
4. **Daytona** sandbox recomputes root (green) + planted tamper (red)  
5. **Voice-origin FCO** labels human vs AI audio bytes  
6. **WorkOS** optional local AuthKit (migrate URL later)

**Pitch:** Audit every agent byte. Reject on mismatch. Custody = provenance, not correctness.

**Devpost draft:** https://devpost.com/software/1362706 (rename Untitled → Braintona)  
**Repo:** https://github.com/biobitworks/braintona  
**Paste description:** `docs/DEVPOST_DESCRIPTION.md`  
**Local demo:** http://127.0.0.1:8787

## Status

| Piece | State |
|---|---|
| Daytona / Braintrust / Fireworks / FCO | Working |
| WorkOS local AuthKit | Wired (set dashboard redirects) |
| Voice-origin API | Working (need human .mp3 in `public/assets/voice/`) |
| ElevenLabs TTS | Key present; fix voice_id (404) |
| CodeRabbit key | In `.env` (`cr-6…`); **Path B queued** — see `docs/CODERABBIT_DISCORD_PATH_B.md` |
| CopilotKit | Missing license |
| FireConnect Cursor | ON earlier — **turn OFF** to save FW credits: `fireconnect cursor off` |
| Devpost submit | Later OK; draft exists |
| Demo video | TODO |

## Resume (when back)

```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
fireconnect cursor off   # conserve Fireworks
npm run dev              # http://127.0.0.1:8787
# phone: Cursor iOS Remote Control to this session
```

**Next (queued — “in a bit”):** **CodeRabbit Discord Path B** — run `docs/CODERABBIT_DISCORD_PATH_B.md` checklist (Add to Discord → scope `braintona` → one `@CodeRabbit` turn → bank receipt). Needs operator Discord/browser; not MVP-blocking.

**Other build steps:** push WorkOS commit · fix ElevenLabs voice_id · drop human voice file · fill Devpost About from `docs/DEVPOST_DESCRIPTION.md` · record &lt;2m video · submit by 15:30.

## Team

Solo: Byron P. Lee — byron@biobitworks.com — agent credited in description, not on Devpost team.
