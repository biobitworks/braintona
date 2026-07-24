# CodeRabbit Discord Bot Challenge — Path B (Best Use)

**Source:** https://coderabbit.notion.site/coderabbit-discord-bot-challenge  
**Prize:** $1,000 Best Use (+ extra $1,000 if judges call it impressive)  
**Status:** Blocked on GitHub org invite (step 3) — `biobitworks` not yet in `the-builders-burrow`  
**Locked decision:** Path B = use CodeRabbit’s Discord Agent (not a custom Discord bot MVP)  
**Personal public repo (already live):** https://github.com/biobitworks/braintona  
**Key:** `CODERABBIT_API_KEY` in `.env` (do not print)

## Official steps (from Notion)

1. **Sign up for CodeRabbit** → https://www.coderabbit.ai  
2. **Join the Discord server** → https://discord.gg/vChJthkzr  
3. **Accept the GitHub organization invitation**  
   - Speak to CodeRabbit team / check the email used for the event  
   - Invite is to org: **`the-builders-burrow`**  
4. **Create your team repository**  
   - Notion wording: “Inside the **working-ant** GitHub organization, create a new **public** repository”  
   - Note (2026-07-24 probe): GitHub login `Working-Ant` is a **User** (2 forks), not an org API target. After invite, create the public team repo where CodeRabbit grants create rights (expect **`the-builders-burrow/<team-repo>`** unless they clarify).  
   - Give all teammates access.  
5. **Create a Discord channel for your team** in the hackathon Discord server.  
6. **Connect your GitHub repository** via the Discord chat OAuth flow for the CodeRabbit Discord Bot.  
   - Ensure **`the-builders-burrow`** is connected in GitHub.  
7. **Start building** — use the Discord Bot creatively (MCP servers, apps, etc.); submit before deadline.

## Braintona Path B checklist (≤15 min once invite lands)

- [ ] CodeRabbit account signed in (same email as event)  
- [ ] Discord joined via https://discord.gg/vChJthkzr  
- [ ] Accept `the-builders-burrow` org invite (check email + GitHub notifications)  
- [ ] Create **public** team repo (name suggestion: `braintona` or `second-machine-braintona`)  
- [ ] Push / mirror `biobitworks/braintona` → team public repo (do not force-push main)  
- [ ] Create team Discord channel (e.g. `#second-machine` / `#braintona`)  
- [ ] In-channel: complete GitHub OAuth; confirm `the-builders-burrow` connected  
- [ ] Scope channel to the team public repo only; low spend; GitHub connection only  
- [ ] Smoke turn, e.g. `@CodeRabbit summarize open PRs on <org>/<repo>`  
- [ ] Bank interaction receipt (channel + UTC + prompt + reply excerpt) → `.planning/receipts.jsonl`  
- [ ] Seal observe hop in demo UI: `POST /api/coderabbit/seal-observe`  
- [ ] Devpost sponsor line checked (already drafted in `docs/DEVPOST_SUBMISSION.md`)

## Current host probe (`biobitworks` / magicPRObox)

| Check | Result |
|---|---|
| Org memberships | `EpicGames`, `yunes-aging` only |
| `the-builders-burrow` member? | **No** — create repo → `403` admin access required |
| `Working-Ant` | **User**, not org — cannot `gh repo create Working-Ant/...` as org |
| Personal public Braintona | https://github.com/biobitworks/braintona — live; PR #3 + `@coderabbitai review` |

## Non-goals

- Custom Discord bot code in this repo  
- Blocking the ≤60s custody demo loop  
- Putting Discord bot tokens into Braintona `.env`  
- Claiming science truth / writeback from Discord turns (`llm_in_science_leaf: false`)

## Resume commands (after org invite accepted)

```bash
cd /Users/byron/projects/active/braintona

# Confirm invite landed
gh api user/memberships/orgs/the-builders-burrow

# Create public team repo (adjust org if CodeRabbit specifies otherwise)
gh repo create the-builders-burrow/braintona --public \
  --description "Braintona — Daytona HackSprint SF Jul 2026 (Second Machine)" \
  --source . --remote builders-burrow --push

# Then: Discord channel → OAuth connect → smoke @CodeRabbit turn → bank receipt
```

## Done when

- [ ] Public team repo under the challenge org  
- [ ] Discord channel + CodeRabbit Bot connected to that repo  
- [ ] One successful in-channel `@CodeRabbit` turn with receipt  
- [ ] Observe hop sealed into token trace  
- [ ] Devpost CodeRabbit Best Use bullet checked
