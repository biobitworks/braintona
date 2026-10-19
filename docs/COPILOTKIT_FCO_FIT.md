# CopilotKit ↔ FCO design fit

**Locked:** 2026-07-24 — CopilotKit is the most relevant HackSprint sponsor UI for Braintona’s FCO/interaction model.

**Update:** Operator has a **CopilotKit organization**. Local CLI was still **Not logged in** — org must be selected via browser login on this machine, then license written to `.env`.

## Why it fits

| FCO concept | CopilotKit surface |
|---|---|
| Interaction object (customer ↔ agent / operator ↔ custody agent) | Chat thread / generative UI session |
| Turn leaves (human vs AI) | User message vs assistant/tool message |
| Point of contact + local signature | Each tool call / action that hits Fireworks, Braintrust, Daytona, vault |
| Two trees under one MMR | Operator tree + agent tree bagged per thread |
| Claim ceiling in UI | Render provenance strip on every reply (root, sig, PoC) — not “the model is correct” |

Daytona/Braintrust/Fireworks prove **custody**. CopilotKit is where a human **drives and sees** that custody as conversation turns.

## Operator gate (org → license) — do this now

## Phone / remote token drop (no chat paste)

Do **not** paste the license into Cursor chat.

```bash
# Termius / SSH from phone — one line token only:
printf '%s' 'YOUR_COPILOTKIT_LICENSE_TOKEN' > /Users/byron/projects/active/braintona/.planning/private/copilotkit_license.token
```

A watcher (`scripts/watch_copilotkit_token_drop.sh`) auto-ingests into `.env`, clears the drop file, restarts the server, and seals a cockpit turn. Manual: `bash scripts/ingest_copilotkit_token.sh`.


Dashboard: https://dashboard.operations.copilotkit.ai

```bash
cd /Users/byron/projects/active/braintona
bash scripts/copilotkit_org_bootstrap.sh
# equivalent:
#   npx copilotkit@latest login          # pick your organization
#   npx copilotkit@latest project select
#   npx copilotkit@latest license create --write
npm run start   # restart so /api/health shows copilotkit: true
```

`COPILOTKIT_LICENSE_TOKEN` stays in `.env` (gitignored). Never commit it.

## Wired in repo (pre-license + post-license)

| Surface | Path |
|---|---|
| Status | `GET /api/copilotkit/status` |
| Seal turn | `POST /api/copilotkit/seal-turn` `{ text, actor }` |
| Latest thread | `GET /api/copilotkit/interaction/latest` |
| UI panel | `/` → **CopilotKit operator cockpit** |
| Bootstrap | `scripts/copilotkit_org_bootstrap.sh` |

Each sealed turn → FCO leaf (`text_sha256` only in public JSON) → `interaction_mmr_root`.  
`license_present` is recorded on the thread when the token exists.

## Best Use path (Path C — FCO-native)

1. Operator sends a message → seal **operator/human** turn leaf  
2. Agent/tool runs pipeline / verify → seal **AI/tool** turn leaf  
3. Thread tip = MMR of turn leaves  
4. Next (post-license): full `@copilotkit/*` chat widget calling the same seal + `/api/*` actions  

## Done when

- [ ] `npx copilotkit@latest whoami` shows org (not “Not logged in”)  
- [ ] `COPILOTKIT_LICENSE_TOKEN` in `.env`  
- [ ] `/api/health` → `keys.copilotkit: true`  
- [ ] ≥1 operator turn + ≥1 AI turn sealed (`/api/copilotkit/interaction/latest`)  
- [ ] Devpost: CopilotKit operator cockpit over FCO receipt stream  

## Priority

Elevated for **FCO design relevance**. Org existing unblocks Best Use — finish login + license before 15:30 if possible; do **not** block Devpost submit on the full React widget.
