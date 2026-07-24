# STATE — Braintona (handoff)

**Updated:** 2026-07-24 ~10:56 PDT  
**Deadline:** 15:30 PDT Devpost  
**Hosts:** magicPRObox (cockpit) · magicSTUDIObox (compute)  
**Session:** cursor-6430eeef-1426-4566-a6fc-5d688723f05b  
**Branch:** `cursor/braintona-main-app-kg-e2e-cc88` · PR https://github.com/biobitworks/braintona/pull/3

## MVP (what we ship)

**Braintona** — custody agent for AI handoff:

1. **Fireworks** extracts claims (temp 0)  
2. **Braintrust** scores vs gold (pass/fail)  
3. **FCO/MMR** seals ops+content receipt  
4. **Daytona** sandbox recomputes root (green) + planted tamper (red)  
5. **Custody knowledge graph** grows per run (`/api/graph` + UI)  
6. **Voice-origin FCO** labels human vs AI audio bytes  
7. **WorkOS** optional local AuthKit (migrate URL later)

**Pitch:** Audit every agent byte. Reject on mismatch. Custody = provenance, not correctness.

**Devpost draft:** https://devpost.com/software/1362706  
**Repo:** https://github.com/biobitworks/braintona  
**Local demo:** http://127.0.0.1:8787

## Status

| Piece | State |
|---|---|
| Daytona / Braintrust / Fireworks / FCO | Working — **Fireworks promo added** (use for /api/run; keep FireConnect Cursor off) |
| Custody knowledge graph | Live — `/api/graph` + UI; grows per pipeline run |
| Touch signatures + PoC | Each hop: actor sig (AI/human/sponsor/runtime) + FCG combine prior⊕touch→tip |
| Live token trace | Content-leaf token walks Fireworks→Braintrust→FCO/FCG→Daytona→sponsors (`/api/trace/latest`) |
| Private conversation custody | Sealed — graph node `conversation_private` (hashes only); vault gitignored |
| WorkOS local AuthKit | Wired (set dashboard redirects) |
| Voice-origin API | Working (optional human .mp3 in `public/assets/voice/`) |
| ElevenLabs TTS | Key present; fix voice_id if 404 |
| CodeRabbit key | In `.env`; Path B queued — `docs/CODERABBIT_DISCORD_PATH_B.md` (on other PR) |
| CopilotKit | **Elevated for FCO fit** — license missing; see docs/COPILOTKIT_FCO_FIT.md |
| **E2E** | **`npm run e2e` → 10/10 PASS** (graph 3→5, session root advanced) |
| Demo video | TODO |
| **3-min presentation** | Ready — `docs/PRESENTATION_3MIN.md` + `/pitch.html` |

## Resume

```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
npm run start            # http://127.0.0.1:8787
npm run e2e              # full API loop
# UI: Run live pipeline twice — watch knowledge graph grow
```

**Last E2E:** `npm run e2e` → 10/10 PASS.

**Next:** **CopilotKit FCO cockpit** — `npx copilotkit@latest login` → `license create` → seal chat turns as interaction FCO leaves (docs/COPILOTKIT_FCO_FIT.md).

**Queued:** CodeRabbit Discord Path B (observe lane).

**Other:** fix ElevenLabs voice_id · human voice sample · Devpost About · &lt;2m video · submit by 15:30.
