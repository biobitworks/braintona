# Braintona — 3-minute presentation

**Team:** Second Machine · **Solo:** Byron P. Lee  
**Spine:** Fill the gaps · name where we fail · value for everyone · live proof  
**Repo:** https://github.com/biobitworks/braintona  
**Slides:** http://127.0.0.1:8787/pitch.html · **App:** http://127.0.0.1:8787  
**Master pack:** `docs/PITCH_PACK.md`

## Judging (keep in head)

| Axis | How this deck scores it |
|---|---|
| Impact 25% | Who wins when the handoff gap closes |
| Technical 25% | Live second-machine attest + fail closed |
| Creativity 25% | Gaps + honest failure table + vault tip |
| Presentation 25% | Spine + live + one close |
| Sponsor bonus | Token-trace hops, not logo wall |

**Final format:** 3 min pitch · 2 min Q&A · Best Use from **all** teams

## Thesis (say this early)

Agents already generate answers. The gap is **handoff trust**. Braintona fills it with a custody contract — and we tell you exactly where that contract **stops**.

---

## Slide deck (6 × ~15s)

### 1 — Hook
**We fill the handoff gap.**  
Agents answer; the next person still re-checks everything. Custody closes that loop.

### 2 — Gaps we fill
1. **Same-box verify** — runner checks itself  
2. **Unlabeled voice** — customer vs agent audio look identical in logs  
3. **Silent sponsor hops** — model/eval/sandbox/review with no point of contact  

*We seal hops. Second machine must match. Fail closed.*

### 3 — Where this fails (safeguards / originality)
| We do **not** claim | Instead |
|---|---|
| Science / answer is true | Provenance of **recorded bytes** |
| Biometric speaker ID / deepfake score | Explicit `human` vs `ai` labels on sealed audio |
| Bad prompts are impossible | Tampered **receipts** reject |
| Cloud holds your private root | **Vault** holds customer Merkle tip; lose vault ⇒ lose private authority |

*Judges trust us because we say where we stop.*

### 4 — Value for everyone
| Who | Value |
|---|---|
| **Operator / scientist** | Hand off a run; recompute elsewhere; skip re-auditing the chat |
| **Customer on the call** | Voice tip can stay vault-private; agent tree labeled separately |
| **Reviewer / compliance** | AI / human / sponsor signatures at each FCG point of contact |
| **Sponsors in the stack** | Fireworks, Braintrust, Daytona, ElevenLabs each leave a bound hop |

### 5 — How (one breath)
Fireworks → Braintrust → FCO MMR → Daytona ✓ / tamper ✗  
Token trace + two-avatar (Sarah ↔ Matilda) interaction graph  
*Provenance ≠ correctness.*

**Component:** MMR of **actual voice vs AI** — labels on sealed bytes, not a deepfake score.

### 6 — Live bridge
Show the gap closing: pipeline · attest · tamper · signed path · voice trees + vault.

---

## Spoken close (12s)

“We fill the handoff gap. We fail honestly — we don’t prove truth, only custody. Operators move faster, customers keep a private tip, reviewers see every touch, sponsors aren’t a black box. That’s value for everyone.”

---

## Live showcase (~90s) — prove the gaps close

| Time | Click | Line |
|---|---|---|
| 0:00 | `/` | “Gap one: same-box verify — watch a second machine.” |
| 0:10 | **Run live pipeline** | Fireworks + Braintrust + FCO seal… |
| 0:35 | Daytona + **tamper** | “Independent recompute. Tamper fails closed — where bad receipts die.” |
| 0:50 | **Token trace** | “Gap three: silent hops — every sponsor touch gets a signature and point of contact.” |
| 1:05 | **Two-avatar call** | “Gap two: unlabeled voice — customer Sarah vs agent Matilda; customer tip in the vault.” |
| 1:25 | Ceiling | “We don’t claim truth. We claim custody. That’s the value.” |

**If Daytona slow:** local verify green + tamper red still sell fail-closed.  
**If eval F1 red:** “Eval scores quality; custody scores integrity — different jobs.”

---

## Prep

```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
fireconnect cursor off
npm run start
# windows: /pitch.html  and  /
```

- [ ] Warm pipeline once  
- [ ] Two-avatar audio plays  
- [ ] Practice saying **where we fail** without apology — it’s the safeguard slide  
- [ ] Devpost mirrors this honesty (`docs/DEVPOST_SUBMISSION.md`)  
- [ ] Demo video &lt;2m uploaded (storyboard: `docs/PITCH_PACK.md` §7)  
