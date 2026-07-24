# Devpost requirements checklist — Braintona

**Hackathon:** Daytona HackSprint w/ Braintrust — SF, July 2026  
**Devpost user:** byron940  
**Submissions:** open soon (as of last check)  
**Deadline:** 15:30 PDT

## What to build (theme)

| Expectation | Status | Notes |
|---|---|---|
| AI agent with reasoning | PARTIAL | Claim-extract agent + eval pass/fail decision |
| Independent decision-making | YES | Cheapest/quality-bar style: eval floor gates “pass” |
| Safe integration w/ industry tools | YES | FCO claim ceilings; reject-iff-mismatch; no science leaf LLM |
| Originality / real-world impact | YES | Custody handoff for bio/AI research integrity (Glasswork lineage) |

## What to submit

| Item | Status | Artifact |
|---|---|---|
| Team name | READY | **Braintona** |
| Team members + email/socials | READY | Byron P. Lee · byron@biobitworks.com · github.com/biobitworks · linkedin.com/in/biobitworks |
| Demo video (<2 min) | TODO | Need screen capture of live pipeline |
| Summary (2–3 sentences) | READY | `docs/DEVPOST_SUBMISSION.md` |
| Problem + impact | READY | same |
| Technical architecture | READY | same |
| Sponsor tools list + how used | READY draft | see matrix below |
| Public GitHub URL | TODO | create + push |
| Devpost project created/submitted | DRAFT | https://devpost.com/software/1362706 (private until login/publish) |

## Sponsor / Best Use matrix (Notion + Devpost prizes)

| Sponsor | Prize lane | Wired in code? | Live verified? | Gap |
|---|---|---|---|---|
| **Daytona** | Best Use + main | YES SDK sandbox recompute | YES | Keep in demo video |
| **Braintrust** | Best Use + main | YES eval logger | YES | Show project dashboard in video |
| **Fireworks AI** | Best Use + main | YES chat completions | YES (`glm-5p1`) | — |
| **ElevenLabs** | Best Use | YES `/api/narrate` | NO (key 401) | Fix API key or bake web-UI MP3 |
| **CopilotKit** | Best Use | DOC+FIT | NO | **Elevated** — login + `license create` then FCO turn chat (docs/COPILOTKIT_FCO_FIT.md) |
| **CodeRabbit** | Best Use | DOC only | NO | Discord bot + public repo in builders org |
| WorkOS | participation | N/A | N/A | Redeem later; not demo-critical |

## Judging criteria coverage

| Criterion (25%) | How we hit it |
|---|---|
| Impact | Auditability for agent handoff in science/ops |
| Technical | Daytona attest + Braintrust eval + FCO MMR + tamper reject |
| Creativity | Custody-as-agent-contract (reject on mismatch) |
| Presentation | Live UI + <2m video + 3m pitch deck (TODO) |
| Sponsor bonus | Maximize Daytona + Braintrust + Fireworks; finish EL/CopilotKit/CodeRabbit |

## Still need from operator (phone)

1. Working ElevenLabs **API** key (current `sk_` returns 401) **or** drop avatar + local voice files into `braintona/public/assets/`
2. CopilotKit license token in `.env`
3. CodeRabbit Discord/GitHub org steps when at venue Wi‑Fi/Slack
4. Confirm when Devpost **Create Project** unlocks
