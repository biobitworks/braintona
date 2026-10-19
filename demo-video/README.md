# Braintona demo video (FCO-atomized)

HackSprint SF · under 2 minutes · picture-in-picture  
**Team:** Biobitworks · **License:** creative export under **CC BY-ND 4.0** (software stack **Apache-2.0**) — see `../LICENSE.md`

## Play
[braintona-demo.mp4](./braintona-demo.mp4)

## Custody (atomized + traceable)
See **[CUSTODY.json](./CUSTODY.json)** — each path is an FCO leaf (`sha256(0x00‖bytes)`), bagged into one MMR tip.

| Atom | `content_class` | Role |
|---|---|---|
| P1 Studio UI `.mov` | `other` | Silent screen capture |
| P2 Pro talent `.mov` | `human` | Face + mic |
| P3 ElevenLabs gap `*.mp3` | `ai` | Labeled gap fills (not passed as human) |
| Walkthrough PNGs | `other` | Visual gap Ken Burns |
| Export mp4 | `other` | Terminal merge leaf |

Claim ceiling: provenance of labeled bytes only — not science truth, not biometric ID.  
`llm_in_science_leaf: false`
