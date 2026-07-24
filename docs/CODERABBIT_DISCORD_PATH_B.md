# CodeRabbit Discord — Path B (Best Use)

**Status:** Queued — do next when operator is ready (venue Wi‑Fi / Discord invite OK)  
**Locked decision:** `docs/SPONSOR_DECISION.md` — Path B, not a custom bot MVP  
**Repo:** https://github.com/biobitworks/braintona (public)  
**Key:** `CODERABBIT_API_KEY` in `.env` (already present)

## Goal (Best Use eligibility)

Public repo + CodeRabbit Discord Agent connected with a scoped channel + one interaction receipt. No Braintona Discord bot code required.

## Operator checklist (≤10 min)

1. Open https://www.coderabbit.ai/discord → **Add to Discord**.
2. In CodeRabbit app: connect Discord server (hackathon builders / sponsor channel, or demo server).
3. Connect GitHub; ensure `biobitworks/braintona` is visible.
4. Create a **Scope** for the challenge channel:
   - repos: `biobitworks/braintona` only
   - spend limit: low
   - connections: GitHub only (no secrets tooling)
5. Smoke turn in-channel, e.g.  
   `@CodeRabbit summarize open PRs on biobitworks/braintona`
6. Capture **interaction receipt** (screenshot + note):
   - channel + UTC time
   - prompt text
   - bot reply excerpt
   - store under `docs/link_capture.jsonl` or `.planning/receipts.jsonl`
7. Devpost bullet (already drafted): CodeRabbit Discord Agent on public `braintona`.

## Non-goals

- Custom Discord bot in this repo
- Blocking MVP demo loop (Daytona / Braintrust / Fireworks / voice FCO)
- Putting Discord tokens into Braintona `.env`

## Resume command

When ready to execute:

```bash
cd /Users/byron/projects/active/braintona
# 1) Confirm key (do not print value)
test -n "${CODERABBIT_API_KEY:-}" || (set -a && source .env && set +a && test -n "$CODERABBIT_API_KEY")
# 2) Follow checklist above in browser
# 3) Append interaction receipt to .planning/receipts.jsonl
```

## Done when

- [ ] Discord server connected in CodeRabbit dashboard  
- [ ] Channel scope limited to `braintona`  
- [ ] One successful `@CodeRabbit` turn  
- [ ] Receipt banked  
- [ ] Devpost sponsor line checked
