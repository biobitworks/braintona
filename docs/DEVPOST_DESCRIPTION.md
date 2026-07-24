# Braintona

### Audit every agent byte — and label every voice leaf.

Braintona is an AI agent that extracts claims with **Fireworks**, scores them with **Braintrust**, and recomputes a **Fractal Custody Object (FCO)** Merkle Mountain Range root inside a **Daytona** sandbox — rejecting on mismatch. It also seals **voice-origin** leaves so judges can tell **human-recorded** vs **AI-synthesized** audio by explicit FCO labels bound to the exact bytes (method: [doi:10.5281/zenodo.21210575](https://doi.org/10.5281/zenodo.21210575)).

> Custody proves **provenance of recorded bytes**, not scientific correctness.

---

## Inspiration

AI agents accelerate science and ops — until you have to re-check everything. Prior work (**Glasswork** on Butterbase, **BioCustody / voiceworks** on Sauna) showed that a recompute-verifiable custody receipt changes the game. Braintona ports that lineage onto the Daytona × Braintrust sponsor stack for a one-day HackSprint, with voice-origin MMR as the accessibility + authenticity wedge for ElevenLabs.

## What it does

1. Runs a gold claim-extraction task through **Fireworks** (`glm-5p1`, temperature 0).
2. Scores precision / recall / F1 with a local gold harness and logs to **Braintrust**.
3. Emits a two-leaf FCO custody receipt (ops + content) → MMR root.
4. Spins an ephemeral **Daytona** Python sandbox that recomputes the root independently.
5. Plants a tamper that **must fail closed**.
6. Seals **voice-origin** FCOs: `content_class ∈ {human, ai}` over audio bytes + generator metadata (ElevenLabs when API works; browser TTS / pending leaf otherwise).
7. Shows honest claim ceilings in the UI.

## How we built it

```text
UI → Fireworks inference → Braintrust eval
  → FCO receipt (leaf 0x00 / node 0x01) → MMR root
  → Daytona sandbox recompute (reject iff mismatch)
  → Voice-origin FCG (human vs AI leaves)
```

- **Runtime:** Node / TypeScript, Express, static operator UI  
- **Custody:** FCO v3 + FCG MMR (published method)  
- **Sandbox:** `@daytona/sdk` ephemeral Python `codeRun`  
- **Eval:** `braintrust` logger + local gold floor  
- **Voice:** ElevenLabs TTS path + local human files in `public/assets/voice/`

### Merkle leaf (conceptual)

Domain-separated hashing (published recipe):

- Leaf: $\mathrm{sha256}(0x00 \Vert \mathrm{canonical\_json})$
- Node: $\mathrm{sha256}(0x01 \Vert L \Vert R)$
- Graph: MMR peaks bagged right-to-left

## Challenges we ran into

- Fireworks account model catalog differed from docs — locked to a live deployed model (`glm-5p1`).
- ElevenLabs App credits ≠ API quota — voice-origin still seals AI leaves with explicit pending/blocked generator metadata when API returns 401.
- Express 5 catch-all route syntax (`/{*path}`).
- Devpost team invites require human emails — solo submitter with agent credited in description.

## Accomplishments that we're proud of

- End-to-end **Daytona** sandbox recompute of a live custody root (green path) + planted tamper (red path).
- **Braintrust** project `braintona-hacksprint` receiving eval spans.
- Voice-origin FCG that makes **human vs AI** an explicit, hash-bound label — not a vibes classifier.
- Honest ceilings printed in the product, not buried in a README.

## What we learned

Independent attestation beats “trust the same process twice.” Putting custody recompute in Daytona and eval in Braintrust forces the demo to survive a second machine and a second scoring path. Labeling voice origin as FCO fields is more judge-legible than claiming a deepfake detector.

## What's next

- CopilotKit operator chat on the same receipt stream  
- CodeRabbit Discord bot lane on the public repo  
- Live ElevenLabs Scale narration once API quota unlocks  
- Optional WorkOS auth for multi-judge sessions  

## Sponsor tools

| Sponsor | How integrated |
|---|---|
| **Daytona** | Ephemeral sandbox recomputes custody root from receipt JSON |
| **Braintrust** | Eval logging / scores for the gold task |
| **Fireworks AI** | Claim-extraction inference |
| **ElevenLabs** | AI-origin voice narration + voice-origin FCO leaves |
| **CopilotKit** | License path for operator chat (next) |
| **CodeRabbit** | Public repo + Discord bot challenge path |
| **WorkOS** | Participation domain redeem (not demo-critical) |

## Built with

`nodejs` `typescript` `express` `daytona` `braintrust` `fireworks` `elevenlabs` `fco` `mmr` `fractal-custody`

## Try it

```bash
git clone https://github.com/biobitworks/braintona.git
cd braintona
cp .env.example .env   # add keys
npm install
npm run dev            # http://127.0.0.1:8787
npm run pipeline       # CLI: Fireworks → Braintrust → Daytona
```

Drop human recordings into `public/assets/voice/`, then `POST /api/voice-origin` to seal human vs AI leaves into one FCG.

## Citations

Lee, B. (2026). *Fractal Custody Objects: route-comparable chain-of-custody for deterministic computational biology and AI-agent provenance.* Zenodo. https://doi.org/10.5281/zenodo.21210575

Lineage demos: [Glasswork](https://glasswork.butterbase.dev/#demo) · [BioCustody](https://biocustody-n6iqdjsn.sauna.new/) · [voiceworks](https://voiceworks-ygitm4zl.sauna.new/) · [BioBridge](https://biobridge-pipeline.kylon.app/final-demo)
