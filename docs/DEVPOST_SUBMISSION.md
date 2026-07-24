# Devpost paste-ready — Braintona

**Hackathon:** https://daytona-hacksprint-sf-jul-2026.devpost.com/  
**Project draft:** https://devpost.com/software/1362706  
**Team invite:** https://devpost.com/software/1362706/joins/6BtDrmZpMRVhGIIT_BT2Og  

**Deadline:** 2026-07-24 **15:30 PDT** (strict)  
**Master pack:** `docs/PITCH_PACK.md`

## Team name
**Second Machine**

## Team members
- Byron P. Lee — byron@biobitworks.com — https://github.com/biobitworks — https://www.linkedin.com/in/biobitworks/

*(Agents / Cursor credited in description as tools — not Devpost teammates.)*

## Project name
Braintona

## Tagline
Fill the handoff gap. Fail closed.

## Elevator (2–3 sentences)
Braintona fills the agent handoff gap: Fireworks extracts claims, Braintrust scores them, and a Daytona sandbox recomputes a Fractal Custody Object (FCO) Merkle root — rejecting on mismatch. Customer and agent voice turns become separately labeled trees with a private vault tip; every sponsor hop leaves a signed point of contact on a live token trace. Custody proves provenance of recorded bytes, not that the answer is scientifically true.

## Problem & impact
Agents accelerate science and ops, but teams still cannot walk away: the same box often “verifies” itself, call audio is unlabeled, and sponsor hops leave no point of contact. Braintona makes fail-closed, second-machine attestation first-class — so operators hand off runs, customers keep a private voice tip, reviewers see every touch, and sponsors stop being a black box. We do not claim scientific truth, biometrics, or deepfake scores; that ceiling is the safeguard.

## Technical architecture
1. Operator UI / CLI posts source text  
2. Fireworks (`glm-5p1`, temp 0) returns claim JSON  
3. Local gold eval + Braintrust logger when keyed  
4. Two-leaf FCO receipt (ops + content) → MMR custody root  
5. Daytona ephemeral Python sandbox recomputes root; planted tamper fails closed  
6. Live token trace: each sponsor hop gets actor, local signature, and point-of-contact hash  
7. Two-avatar ElevenLabs call (Sarah customer / Matilda agent) → two FCO trees → interaction MMR; customer tip in private vault  
8. Session graph bags run custody roots into `bagged_session_root`  
9. WorkOS AuthKit optional for multi-judge sessions  

## Sponsor tools used
- **Daytona** — independent sandbox recompute of custody root; tamper must fail closed  
- **Braintrust** — eval logging / scores for the gold task  
- **Fireworks AI** — claim-extraction inference  
- **ElevenLabs** — two-avatar call + voice-origin FCO leaves  
- **CodeRabbit** — public repo + Discord Path B review lane  
- **CopilotKit** — operator chat / FCO UI fit (license path next)  
- **WorkOS** — AuthKit / participation domain  

## Repo
https://github.com/biobitworks/braintona

## Demo video
(under 2 min — storyboard in `docs/PITCH_PACK.md` §7; upload after capture)

## Built with
Node/TypeScript, Express, Daytona SDK, Fireworks API, Braintrust SDK, ElevenLabs, FCO v3 / FCG MMR (Zenodo 10.5281/zenodo.21210575)

## Judging reminders (internal)
- Round 1 = Devpost quality → top 8  
- Final = 3 min + 2 min Q&A  
- Best Use can come from **any** team — keep sponsor hops demoable  
- Criteria: Impact / Technical / Creativity / Presentation (25% each) + Sponsor Tool Usage bonus  
