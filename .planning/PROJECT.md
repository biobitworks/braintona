# Braintona

## What This Is

Hackathon product for **Daytona HackSprint w/ Braintrust — SF, July 24, 2026**.
An FCO-native AI agent that pairs **Braintrust evals** with **Daytona sandbox attestation** so every inference can be recomputed and rejected on mismatch.

## Core Value

Hand off AI work **without** giving up auditability. Custody proves *which bytes / which model / which eval* — not scientific correctness.

## Requirements

### Validated

- Continue published FCO v3 / FCG MMR method (Zenodo 10.5281/zenodo.21210575)
- Meaningful Daytona + Braintrust integration (Best Use awards are in scope)
- Public GitHub + Devpost by 15:30 PDT
- Honest claim ceilings in UI

### Active

- Fireworks inference path
- CopilotKit operator UI (or compatible chat UI if license gate blocks)
- ElevenLabs narration of verify outcomes when key available
- CodeRabbit Discord/GitHub path documented for Best Use

### Out of Scope

- Live Overwatch/SeedGraph writeback
- New custody cryptography
- Full WorkOS production auth for judges

## Constraints

- Solo builder; operator on phone; agent on magicPRObox; Studio for Metal/Ollarma assist
- Strict Devpost deadline 15:30 PDT
- Do not put Wi‑Fi/passwords or API secrets in git
- `llm_in_science_leaf: false`

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Custody | Copy BioCustody `fco.ts` + Glasswork two-leaf receipts | Proven in prior hack demos |
| Sandbox | Daytona API key on Pro | Sponsor differentiator |
| Eval | Braintrust primary; local gold harness fallback | Coupon may need phone redeem |
| Inference | Fireworks | Key present; Best Use eligible |
| Scope slice | Coarse 4-phase day plan | One-day sprint |

## Evolution

- v0.1 — Goal + FCG bag + scaffold
- v0.2 — Pipeline: Fireworks → Braintrust → Daytona verify
- v0.3 — Demo UI + planted tamper
- v0.4 — Devpost package + submit
