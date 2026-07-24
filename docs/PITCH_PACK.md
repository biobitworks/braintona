# Braintona — Pitch Pack (build as we go)

**Hackathon:** Daytona HackSprint SF · Jul 24, 2026  
**Devpost:** https://daytona-hacksprint-sf-jul-2026.devpost.com/  
**Draft project:** https://devpost.com/software/1362706  
**Deadline:** **15:30 PDT** (hard)  
**Repo:** https://github.com/biobitworks/braintona  
**Local demo:** http://127.0.0.1:8787 · **Slides:** http://127.0.0.1:8787/pitch.html

---

## 1. Devpost submission checklist

| Field | Status | Paste / action |
|---|---|---|
| **Team name** | Ready | **Second Machine** |
| **Team members** | Ready | Byron P. Lee — byron@biobitworks.com — [GitHub](https://github.com/biobitworks) — [LinkedIn](https://www.linkedin.com/in/biobitworks/) |
| **Project name** | Ready | Braintona |
| **Tagline** | Ready | Fill the handoff gap. Fail closed. |
| **2–3 sentence summary** | Ready | §2 below → also `DEVPOST_DESCRIPTION.md` |
| **Problem & impact** | Ready | §3 |
| **Architecture** | Ready | §4 |
| **Sponsor tools + how** | Ready | §5 |
| **Public GitHub URL** | Done | https://github.com/biobitworks/braintona |
| **Demo video (&lt;2 min)** | **TODO** | Record §7 storyboard before submit |
| **Built with tags** | Ready | nodejs, typescript, express, daytona, braintrust, fireworks, elevenlabs, fco, mmr |

**Solo note:** Cursor / cloud agents are credited in the description (tools used), not as Devpost teammates (invite needs human emails).

---

## 2. Elevator (2–3 sentences) — paste to Devpost

Braintona fills the agent **handoff gap**: Fireworks extracts claims, Braintrust scores them, and a **Daytona** sandbox recomputes a Fractal Custody Object (FCO) Merkle root — rejecting on mismatch. Customer and agent voice turns become separately labeled trees with a private vault tip; every sponsor hop leaves a signed point of contact on a live token trace. Custody proves **provenance of recorded bytes**, not that the answer is scientifically true.

---

## 3. Problem & impact (judging: Impact 25%)

**Problem.** Teams still cannot walk away from AI agents. The same process that produced the work often “verifies” itself; voice on a call is unlabeled; sponsor hops (model → eval → sandbox → review) leave no point of contact. Re-audit becomes the default.

**Impact.** Operators and scientists hand off a run instead of re-reading the chat. Customers keep a private Merkle tip for their voice. Reviewers see AI / human / sponsor signatures at each touch. Sponsors in the stack stop being a black box. Fail-closed attestation turns “trust us” into “recompute elsewhere.”

**Ceiling (say it).** We do **not** claim truth, biometrics, deepfake scores, or prompt safety. That honesty is the safeguard — and the originality.

---

## 4. Technical architecture (judging: Technical 25%)

```text
Operator UI / CLI
  → Fireworks (glm-5p1, temp 0) claim extract
  → Braintrust + local gold eval
  → FCO receipt: ops_leaf + content_leaf → custody_root (MMR)
  → Daytona ephemeral Python sandbox recompute (✓ match / ✗ tamper)
  → Token trace: content-leaf token_id through each sponsor hop
       (actor + local signature_hash + prior⊕touch → combined_after)
  → Two-avatar call: Sarah (customer) + Matilda (agent) TTS
       → two FCO trees → interaction MMR; customer tip in private vault
  → Session graph: bagged_session_root = mmr([run custody roots…])
```

**Components**

**Load-bearing voice component:** MMR of **actual voice** vs **AI voice** (`content_class` human vs ai) — see `docs/VOICE_HUMAN_AI_MMR_COMPONENT.md`. **Builds over time** with other **sensor** leaves; raw stream stays **vault-private**. On-device (computers/phones); Samsung **ExecuTorch** quant path as edge example.


| Layer | What |
|---|---|
| Runtime | Node / TypeScript, Express, static UI (`:8787`) |
| Custody | FCO v3 + FCG MMR ([Zenodo doi:10.5281/zenodo.21210575](https://doi.org/10.5281/zenodo.21210575)) |
| Graph | `data/graph_events.jsonl` → nodes/edges + SVG panel |
| Private vault | `.planning/private/` — real bytes + Merkle tip; APIs/git expose hashes only |
| Voice | ElevenLabs multilingual v2; honest `content_class=ai` for TTS stand-ins |
| Auth (optional) | WorkOS AuthKit path for multi-judge sessions |

**Merkle (one line judges remember)**  
Leaf = `sha256(0x00 ‖ canonical_json)` · Node = `sha256(0x01 ‖ L ‖ R)` · bag peaks right-to-left.

---

## 5. Sponsor tools (bonus scoring)

| Sponsor | Integration (meaningful, not checkbox) |
|---|---|
| **Daytona** | Independent sandbox recompute of custody root; planted tamper must fail closed |
| **Braintrust** | Eval spans / scores for gold claim task (`braintona-hacksprint`) |
| **Fireworks AI** | Claim extraction inference (`glm-5p1`) |
| **ElevenLabs** | Two-avatar call + voice-origin FCO leaves (Sarah / Matilda) |
| **CodeRabbit** | Public repo + Path B Discord review lane (in progress) |
| **CopilotKit** | Best FCO UI fit — license/login blocked; documented next |
| **WorkOS** | AuthKit / participation domain (not demo-critical) |

Lineage (not current Best Use hosts): Glasswork / Butterbase, BioCustody, voiceworks — cited as prior art, not claimed as this event’s stack.

---

## 6. Judging map — how the pitch scores each axis

| Criterion (25%) | What we show | Where |
|---|---|---|
| **Impact Potential** | Real handoff pain → who wins (ops, customer, reviewer, sponsors) | Devpost problem · slide 4 · spoken close |
| **Technical Execution** | Live pipeline + Daytona attest + tamper red + graph growth | Live demo · architecture section |
| **Creativity** | Gaps we fill + **where we fail** + private vault tip + token points of contact | Slide 2–3 · ceilings in UI |
| **Presentation** | Spine: gaps → fails → everyone → live; &lt;2m video + 3m stage | `pitch.html` · video · this pack |
| **Sponsor Tool Usage (bonus)** | Each sponsor is a signed hop, not a logo wall | Token trace · sponsor table |

**Round 1** = Devpost only → top 8.  
**Final** = 3 min pitch + 2 min Q&A.  
**Best Use** = partners may pick from **all** teams — keep sponsor hops honest and demoable even if not finalist.

---

## 7. Demo video storyboard (&lt;2 minutes) — record this

**File name:** `braintona-demo-<date>.mp4` · upload to Devpost + optional YouTube unlisted.

| Time | Screen | Voiceover |
|---|---|---|
| 0:00–0:12 | `/pitch.html` slide 1–2 | “Agents answer. The next person still re-checks. We fill three handoff gaps.” |
| 0:12–0:35 | `/` Run live pipeline | “Fireworks extracts. Braintrust scores. We seal an FCO custody root.” |
| 0:35–0:55 | Daytona green → tamper red | “Second machine recomputes. Tamper fails closed.” |
| 0:55–1:15 | Token trace / Replay | “Every sponsor hop gets a signature and a point of contact.” |
| 1:15–1:40 | Two-avatar call | “Customer Sarah vs agent Matilda — separate trees; customer tip stays in the vault.” |
| 1:40–1:55 | Ceiling / graph | “We don’t claim truth. We claim custody. Value for everyone.” |
| 1:55–2:00 | Repo URL on screen | “github.com/biobitworks/braintona” |

**Capture tips:** 1280×720+, mic clear, hide `.env`, zoom UI panels, no PI-seal / secrets.

---

## 8. Stage pitch (3:00) + Q&A bank (2:00)

### Timing

| Clock | Beat |
|---|---|
| 0:00–0:20 | Hook + thesis |
| 0:20–0:50 | Three gaps |
| 0:50–1:10 | Where we fail (table) |
| 1:10–1:30 | Value for everyone |
| 1:30–2:50 | Live (pipeline → tamper → trace → two-avatar) |
| 2:50–3:00 | Close |

Full lines: `docs/PRESENTATION_3MIN.md` · slides: `/pitch.html`.

### Likely Q&A

| Q | A (one breath) |
|---|---|
| Is the science true? | No — custody of recorded bytes only. |
| Is this a deepfake detector? | No — explicit `human`/`ai` labels on sealed audio. |
| Why Daytona? | Second machine must match; same-box verify is the gap. |
| What’s in the vault? | Customer voice bytes + private Merkle tip; public graph gets hashes. |
| CopilotKit / CodeRabbit? | Documented lanes; license/Discord Path B next — stack already live without them. |
| F1 red? | Eval = quality; custody = integrity — different jobs. |
| Solo? | Byron P. Lee / BioBitWorks; agents as tools, credited in writeup. |

---

## 9. Creativity one-liners (use sparingly)

- “Same process verifying itself is not attestation.”
- “Fail closed is a feature, not a bug slide.”
- “Lose the vault, lose private authority — by design.”
- “Sponsors leave fingerprints, not stickers.”

---

## 10. Pre-submit gate (do in order)

- [ ] Paste elevator + problem + architecture + sponsor table into Devpost draft
- [ ] Team name **Second Machine**; member email + socials filled
- [ ] Repo public + README points to try-it
- [ ] Record & upload &lt;2m demo video
- [ ] Warm `npm run start` + one pipeline + two-avatar before any judging click
- [ ] `fireconnect cursor off` (Fireworks promo conservation)
- [ ] Claim ceilings visible in UI and Devpost
- [ ] Submit before **15:30 PDT** — do not wait for optional CopilotKit license

---

## 11. Artifact index

| Artifact | Path |
|---|---|
| This pack | `docs/PITCH_PACK.md` |
| Devpost long form | `docs/DEVPOST_DESCRIPTION.md` |
| Devpost short paste | `docs/DEVPOST_SUBMISSION.md` |
| 3-min script | `docs/PRESENTATION_3MIN.md` |
| Slides | `public/pitch.html` |
| Requirements | `docs/REQUIREMENTS_CHECKLIST.md` |
| CopilotKit fit | `docs/COPILOTKIT_FCO_FIT.md` |
| Private vault | `docs/PRIVATE_CONVERSATION_CUSTODY.md` |
