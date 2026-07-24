# Requirements — Braintona

## Table Stakes

- **TS-01** Public GitHub repository with runnable README
- **TS-02** Live or localhost demo path for judges
- **TS-03** Devpost fields: summary, problem/impact, architecture, sponsor tools, repo URL
- **TS-04** No secrets committed; claim ceilings visible

## Core Features

- **F-01** FCO two-leaf custody receipt per inference (ops + content) → Merkle root
- **F-02** FCG MMR over receipt leaves; verify reject-iff-mismatch
- **F-03** Fireworks model call for task answer (claim extract or short answer)
- **F-04** Braintrust (or schema-compatible local) eval vs tiny gold set
- **F-05** Daytona sandbox recompute of custody root (green path)
- **F-06** Planted tamper demo (red path)
- **F-07** Operator UI (CopilotKit preferred) showing pipeline + verify
- **F-08** ElevenLabs TTS of verify narrative when API key present
- **F-09** Link-capture sidecar for founder/demo URLs
- **F-10** Unsigned FCG bag + receipts under `.planning/`

## Sponsor Mapping

| Sponsor | Requirement |
|---|---|
| Daytona | F-05, F-06 |
| Braintrust | F-04 |
| Fireworks | F-03 |
| CopilotKit | F-07 |
| ElevenLabs | F-08 |
| CodeRabbit | Documented PR/Discord path + bot interaction receipt |
| WorkOS | Participation redeem note only (not demo-critical) |

## Success Metrics

- Demo loop < 60s: task → answer → eval → daytona verify ✓ → tamper ✗
- Devpost submitted before 15:30 PDT
- At least one Daytona sandbox execution receipt hashed
