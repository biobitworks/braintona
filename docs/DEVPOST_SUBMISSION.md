# Devpost paste-ready — Braintona

**Hackathon:** https://daytona-hacksprint-sf-jul-2026.devpost.com/  
**Project draft:** https://devpost.com/software/1362706  
**Team invite:** https://devpost.com/software/1362706/joins/6BtDrmZpMRVhGIIT_BT2Og  

**Deadline:** 2026-07-24 15:30 PDT (strict)

## Team name
Braintona

## Team members
- Byron P. Lee — byron@biobitworks.com — https://github.com/biobitworks — https://www.linkedin.com/in/biobitworks/

## Project name
Braintona

## Tagline
Audit every agent byte.

## Elevator (2–3 sentences)
Braintona is an AI agent that extracts claims with Fireworks, scores them with Braintrust, and recomputes a Fractal Custody Object Merkle root inside a Daytona sandbox — rejecting on mismatch. It continues the Glasswork / BioCustody lineage so you can hand off agent work and still audit exact bytes. Custody proves provenance, not scientific correctness.

## Problem & impact
Agents accelerate science and ops, but teams still cannot walk away: there is no independent, recompute-verifiable chain across inference → eval → sandbox attestation. Braintona makes “reject if it doesn’t match” a first-class demo for bio/AI research integrity and agent handoff.

## Technical architecture
1. Operator UI posts source text to `/api/run`
2. Fireworks (temp 0) returns claim JSON
3. Local gold eval always runs; Braintrust logger used when API key present
4. Two-leaf FCO receipt (ops + content) → MMR custody root
5. Daytona ephemeral Python sandbox recomputes root from receipt bytes
6. Planted tamper path must fail closed
7. ElevenLabs / voice-origin FCO leaves (`content_class` human vs ai) via MMR
8. WorkOS: local demo first; migrate to sponsored custom domain when redeemed

## Sponsor tools used
- **Daytona** — independent sandbox recompute of custody root
- **Braintrust** — eval logging / experiment scores
- **Fireworks AI** — inference
- **ElevenLabs** — verify narration
- **CopilotKit** — operator chat license path
- **CodeRabbit** — public repo + Discord bot challenge
- **WorkOS** — participation domain redeem

## Repo
https://github.com/biobitworks/braintona

## Demo video
(under 2 min — filled after capture)

## Built with
Node/TypeScript, Express, Daytona SDK, Fireworks API, Braintrust SDK, FCO v3 / FCG MMR (Zenodo 10.5281/zenodo.21210575)
