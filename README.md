# Braintona

**Daytona HackSprint w/ Braintrust — SF, July 24, 2026**

> Audit every agent byte. Fireworks answers → Braintrust scores → Daytona recomputes FCO custody → reject on mismatch.

## Why

Glasswork proved multi-model eval + custody receipts on Butterbase. BioCustody/voiceworks (Sauna) proved turn FCOs + voice. **Braintona** ports that lineage onto the HackSprint sponsor stack so judges can watch an independent Daytona sandbox recompute the Merkle root.

## Quick start

```bash
cd /Users/byron/projects/active/braintona
cp .env.example .env   # fill keys; DAYTONA_API_KEY + FIREWORKS_API_KEY already used if exported
npm install
npm run dev
# open http://127.0.0.1:8787
```

CLI one-shot:

```bash
npm run pipeline                 # includes Daytona sandbox
npm run pipeline -- --skip-daytona
```

## Architecture

```
UI (public/)
  → POST /api/run
    → Fireworks chat completion (temp 0)
    → Braintrust log (or local gold eval)
    → FCO two-leaf receipt + MMR root
    → Daytona sandbox Python recompute
    → planted tamper (must reject)
  → POST /api/narrate → ElevenLabs (optional)
```

Claim ceilings (printed in UI):

- Custody = provenance of recorded bytes, **not** scientific correctness
- LLM output = signal, not proof
- Eval = this gold task only

## Sponsor tools

| Tool | Integration |
|---|---|
| **Daytona** | Ephemeral sandbox recomputes custody root from receipt JSON |
| **Braintrust** | Eval logging when `BRAINTRUST_API_KEY` set; local gold always runs |
| **Fireworks AI** | Claim-extraction inference |
| **ElevenLabs** | Narrate verify outcome (`ELEVENLABS_API_KEY`) |
| **CopilotKit** | Operator chat path (license via `npx copilotkit@latest license`) |
| **CodeRabbit** | Public repo + Discord bot challenge channel |
| **WorkOS** | Participation domain redeem (not demo-critical) |

## Lineage

- FCO/FCG: https://doi.org/10.5281/zenodo.21210575
- Glasswork: https://glasswork.butterbase.dev/#demo
- BioBridge: https://biobridge-pipeline.kylon.app/final-demo
- voiceworks: https://voiceworks-ygitm4zl.sauna.new/
- BioCustody: https://biocustody-n6iqdjsn.sauna.new/

## Team

Byron P. Lee — Founder, Cellico.Bio · [biobitworks](https://github.com/biobitworks)

## Devpost

https://daytona-hacksprint-sf-jul-2026.devpost.com/

## WorkOS

Local demo first (no auth gate for judges). When the hackathon WorkOS custom domain offer is redeemed, migrate the public URL behind WorkOS AuthKit — same app, hosted entrypoint later.

