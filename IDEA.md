# Braintona — Daytona HackSprint SF Jul 2026

## Goal (LOCKED 2026-07-24 09:12 PDT)

Ship a **public, demoable AI agent** before **15:30 PDT** Devpost deadline that:

1. Continues the **FCO / FCG** custody lineage (Zenodo DOI 10.5281/zenodo.21210575)
2. Evolves **Glasswork** (Butterbase multi-model eval + custody receipts) into a **Daytona × Braintrust** stack
3. Reuses patterns from **BioCustody / voiceworks** (Sauna) and **BioBridge** (Kylon)
4. Wins on **impact + technical execution + creativity + presentation**, with meaningful **sponsor tool usage**

## One-liner

**Braintona** is the agent that runs your task, scores it with Braintrust, recomputes custody inside a Daytona sandbox, and rejects on mismatch — so you can hand off AI work and still audit every byte.

## Problem

AI agents accelerate science and ops, but you still cannot walk away: no recompute-verifiable chain of custody across inference → eval → sandbox attestation. Bigger models do not mean safer handoff.

## Solution

Copilot-facing agent that:

| Step | Tool | Role |
|---|---|---|
| Chat / UI | CopilotKit | Operator cockpit |
| Inference | Fireworks AI | Model calls (signal) |
| Eval floor | Braintrust | Pass/fail vs gold task |
| Sandbox attest | Daytona | Independent custody recompute |
| Custody | FCO v3 / FCG MMR | Provenance leaves + Merkle root |
| Voice | ElevenLabs | Narrate verify ✓/✗ |
| Code review lane | CodeRabbit | PR bot path for agent code |

## Prior art binding (answer source for GSD questions)

- **FCO/FCG** — published method; leaf `0x00`, node `0x01`; claim ceiling = provenance ≠ correctness
- **Butterbase / Glasswork** — cheapest-passing-model + in-browser verify + planted tamper
- **Kylon BioBridge** — bio pipeline demo pattern
- **Sauna (voiceworks / biocustody)** — turn FCOs, ElevenLabs narration, live verify API

## Non-goals (today)

- PI-seal / SeedGraph live writeback
- New unpublished custody crypto
- Full production multi-tenant auth (WorkOS redeem is participation reward, not core demo)

## Success criteria

- [ ] Live demo URL + public GitHub repo
- [ ] Daytona sandbox shows green recompute + red planted tamper
- [ ] Braintrust eval run logged (or local-compatible harness with same schema if key pending)
- [ ] Devpost submitted ≤ 15:30 PDT with description, stack list, demo video/screens
- [ ] Unsigned FCG bag + link-capture receipts committed locally

## Team

Solo: Byron P. Lee (biobitworks) — phone-available operator; agent loop on magicPRObox with magicSTUDIO compute assist.

## Deadline spine

| Time PDT | Gate |
|---|---|
| 10:00 | Hacking begins — MVP path frozen |
| 12:30 | Lunch — demo must already run locally |
| 14:30 | Soft freeze — only polish + video |
| 15:00 | Devpost draft filled |
| **15:30** | **Submit** |
