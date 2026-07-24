# Braintona

### Fill the handoff gap. Fail closed.

Braintona is an AI agent that extracts claims with **Fireworks**, scores them with **Braintrust**, and recomputes a **Fractal Custody Object (FCO)** Merkle Mountain Range root inside a **Daytona** sandbox — rejecting on mismatch. Customer and agent voice turns become separately labeled trees with a private vault tip; every sponsor hop leaves a signed point of contact on a live token trace. Method: [doi:10.5281/zenodo.21210575](https://doi.org/10.5281/zenodo.21210575).

> Custody proves **provenance of recorded bytes**, not scientific correctness.

**Team:** Second Machine · **Submitter:** Byron P. Lee (byron@biobitworks.com)

---

## Inspiration

AI agents accelerate science and ops — until you have to re-check everything. Prior work (**Glasswork** on Butterbase, **BioCustody / voiceworks** on Sauna) showed that a recompute-verifiable custody receipt changes the game. Braintona ports that lineage onto the Daytona × Braintrust sponsor stack for a one-day HackSprint, and extends it with **three handoff gaps**: same-box verify, unlabeled voice, and silent sponsor hops.

## What it does

1. Runs a gold claim-extraction task through **Fireworks** (`glm-5p1`, temperature 0).
2. Scores precision / recall / F1 with a local gold harness and logs to **Braintrust**.
3. Emits a two-leaf FCO custody receipt (ops + content) → MMR root.
4. Spins an ephemeral **Daytona** Python sandbox that recomputes the root independently.
5. Plants a tamper that **must fail closed**.
6. Traces a content-leaf **token** through each sponsor hop (actor + local signature + point of contact).
7. Runs a **two-avatar** ElevenLabs call (Sarah customer / Matilda agent) → two FCO trees → interaction MMR; customer tip sealed in a private vault (hashes only in the public graph).
8. Grows a session custody graph as runs accumulate.
9. Shows honest claim ceilings in the UI.

## How we built it

```text
UI → Fireworks inference → Braintrust eval
  → FCO receipt (leaf 0x00 / node 0x01) → MMR root
  → Daytona sandbox recompute (reject iff mismatch)
  → Token trace (signed sponsor points of contact)
  → Two-avatar voice trees + private vault tip
  → Session graph: bagged_session_root
```

- **Runtime:** Node / TypeScript, Express, static operator UI  
- **Custody:** FCO v3 + FCG MMR (published method)  
- **Sandbox:** `@daytona/sdk` ephemeral Python `codeRun`  
- **Eval:** `braintrust` logger + local gold floor  
- **Voice:** ElevenLabs multilingual v2 + local vault under `.planning/private/`  
- **Graph:** JSONL events → nodes/edges + SVG panel  

### Merkle leaf (conceptual)

Domain-separated hashing (published recipe):

- Leaf: $\mathrm{sha256}(0x00 \Vert \mathrm{canonical\_json})$
- Node: $\mathrm{sha256}(0x01 \Vert L \Vert R)$
- Graph: MMR peaks bagged right-to-left

## Challenges we ran into

- Fireworks account model catalog differed from docs — locked to a live deployed model (`glm-5p1`).
- ElevenLabs App credits ≠ API quota — voice path seals AI leaves with honest generator metadata when blocked.
- Express 5 catch-all route syntax (`/{*path}`).
- CopilotKit requires login + license token before Best Use UI lane.
- Devpost team invites require human emails — solo submitter with agents credited as tools in the description.

## Accomplishments that we're proud of

- End-to-end **Daytona** sandbox recompute of a live custody root (green path) + planted tamper (red path).
- **Braintrust** project receiving eval spans for the gold task.
- Live **token trace** with AI / human / sponsor_system / custody_runtime actors and points of contact.
- **Two-avatar** call with separate customer/agent FCO trees and a vault-private customer tip.
- Honest ceilings printed in the product — we name where custody **fails** on purpose.

## What we learned

Independent attestation beats “trust the same process twice.” Putting custody recompute in Daytona and eval in Braintrust forces the demo to survive a second machine and a second scoring path. Labeling voice origin and sponsor hops as FCO fields is more judge-legible than claiming a deepfake detector or a truth oracle.

## What's next

- CopilotKit operator chat on the same receipt stream (license path)  
- CodeRabbit Discord bot lane receipt on the public repo  
- Human-first interaction mint (vault root before AI turn) beyond TTS stand-ins  
- Optional WorkOS auth for multi-judge sessions  

## Sponsor tools

| Sponsor | How integrated |
|---|---|
| **Daytona** | Ephemeral sandbox recomputes custody root from receipt JSON; tamper fails closed |
| **Braintrust** | Eval logging / scores for the gold task |
| **Fireworks AI** | Claim-extraction inference |
| **ElevenLabs** | Two-avatar call + voice-origin FCO leaves |
| **CopilotKit** | Best FCO UI fit — license/login path next |
| **CodeRabbit** | Public repo + Discord Path B challenge |
| **WorkOS** | AuthKit / participation domain (not demo-critical) |

## Built with

`nodejs` `typescript` `express` `daytona` `braintrust` `fireworks` `elevenlabs` `fco` `mmr` `fractal-custody`

## Try it

```bash
git clone https://github.com/biobitworks/braintona.git
cd braintona
cp .env.example .env   # add keys
npm install
npm run start          # http://127.0.0.1:8787
npm run pipeline       # CLI: Fireworks → Braintrust → Daytona
npm run demo:two-avatar
```

Slides: http://127.0.0.1:8787/pitch.html · Pitch pack: `docs/PITCH_PACK.md`

## Citations

Lee, B. (2026). *Fractal Custody Objects: route-comparable chain-of-custody for deterministic computational biology and AI-agent provenance.* Zenodo. https://doi.org/10.5281/zenodo.21210575

Lineage demos: [Glasswork](https://glasswork.butterbase.dev/#demo) · [BioCustody](https://biocustody-n6iqdjsn.sauna.new/) · [voiceworks](https://voiceworks-ygitm4zl.sauna.new/) · [BioBridge](https://biobridge-pipeline.kylon.app/final-demo)
