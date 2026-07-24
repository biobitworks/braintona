# Braintona — 3-minute presentation

**Format:** impactful slides (~90s) + live showcase (~90s)  
**Solo:** Byron P. Lee · Repo: https://github.com/biobitworks/braintona  
**Local demo:** http://127.0.0.1:8787 · Slides: http://127.0.0.1:8787/pitch.html

## Judging map

| Expectation | How we hit it |
|---|---|
| **Originality** | FCO/FCG custody as the agent contract: two voice trees + token trace with actor signatures at each FCG point of contact; private vault holds customer Merkle tip |
| **Technical strength** | Fireworks → Braintrust → MMR seal → **Daytona independent recompute** → planted tamper fail-closed; live graph + signature chain |
| **Real-world impact** | Hand off AI lab/ops work without re-trusting the same process twice; provenance for agent bytes + voice origin |
| **Safeguards** | Honest ceilings on-screen; reject on mismatch; PHI/transcript hashes only; AI avatar TTS labeled `content_class=ai` |

---

## Slide deck (6 slides · ~15s each)

### 1 — Hook / brand
**BRAINTONA**  
Audit every agent byte. Reject on mismatch.

*One line:* Custody proves provenance — not that the model is right.

### 2 — Problem
Agents accelerate science & ops… until handoff.  
You re-check everything. Same laptop “verifies” itself. Voice is unlabeled.

### 3 — Idea / advantage
**Fractal Custody Objects** (published method) as the agent contract:  
seal ops + content leaves → MMR root → **second machine** (Daytona) must match.  
Two-avatar call: customer tree ↔ agent tree → interaction MMR; customer tip in **vault**.

### 4 — Technical spine (one diagram)
```text
Fireworks → Braintrust → FCO MMR → Daytona ✓ / tamper ✗
         ↘ token trace: AI / human / sponsor sigs at each PoC
ElevenLabs: Sarah (customer) + Matilda (agent) → dual FCO trees
```

### 5 — Safeguards
- Reject iff root mismatch (planted tamper demo)  
- Claim ceiling printed in UI  
- Private vault for customer Merkle root; public graph = hashes only  
- Voice leaves: explicit `human` vs `ai` — not a deepfake score

### 6 — Impact + ask
**Impact:** Safer AI handoff for lab/ops — auditability without slowing the agent.  
**Live next:** pipeline + graph + two-avatar call.  
**Lineage:** Glasswork · BioCustody · doi:10.5281/zenodo.21210575

---

## Live showcase script (~90s)

**Prep (before you stand up):**
```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
fireconnect cursor off   # conserve Fireworks promo
npm run start            # :8787
# Browser: pitch.html on one window, / on another
# Optional: pre-run pipeline once so graph isn’t empty
```

| Time | Action | Say |
|---|---|---|
| 0:00 | Open `/` | “This is Braintona — custody agent for AI handoff.” |
| 0:10 | **Run live pipeline** | “Fireworks answers, Braintrust scores, we seal an FCO root…” |
| 0:35 | Point steps green + **tamper** | “…Daytona recomputes independently. Planted tamper rejects.” |
| 0:50 | **Live token trace** | “Same custody token through every sponsor touch — AI and human signatures combine at each FCG point of contact.” |
| 1:05 | **Two-avatar call demo** | “Customer Sarah vs agent Matilda — two FCO trees, one interaction root; customer tip stays in the vault.” |
| 1:25 | Graph / ceiling line | “Provenance of recorded bytes — not scientific correctness.” |
| 1:30 | Stop | “Happy to take questions.” |

**If Daytona is slow:** say “sandbox attest queued — local verify already green; tamper already red” and move to avatars.  
**If eval F1 fails gold:** still show custody green/tamper red — eval ≠ custody.

---

## Spoken close (10s)

“We didn’t build another chatbot. We built a custody contract: second machine, fail closed, labeled voice, private root. That’s how agents become handoff-safe.”

---

## Checklist before stage

- [ ] `npm run start` healthy (`/api/health` keys: daytona, fireworks, braintrust, elevenlabs)  
- [ ] `pitch.html` opens  
- [ ] One warm pipeline run completed  
- [ ] Two-avatar MP3s play once  
- [ ] Claim ceiling visible (don’t overclaim)  
- [ ] Devpost draft filled from `docs/DEVPOST_DESCRIPTION.md`
