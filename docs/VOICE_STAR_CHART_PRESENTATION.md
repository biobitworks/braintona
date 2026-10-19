# Presentation star chart vs technical custody graph

**Locked:** 2026-07-24  
**Reference:** Cellico / bioviz-tech Cloudmer star chart + `signal-layer-media-module.tsx` (Canvas + RAF, glint nodes, probability clouds, traverse-over-time)

## Split (do not collapse)

| Surface | Audience | Job |
|---|---|---|
| **Custody knowledge graph** (`#graphPanel`) | Technical review / judges digging into receipts | Flat/lane FCO nodes, edges, session bag root — keep as-is |
| **Voice star chart** (`/demo-voice-star.html`) | Presentation / stage / Devpost video | Fractal star field: voice atoms, golden glint on customer, timed traverse like a short film |

## Presentation visual language (from Cellico)

1. **Star field** — many faint atoms (session noise / prior leaves)
2. **Probability clouds** — soft radial cue around each voice leaf (schematic, not a score)
3. **Golden glint** — customer voice interaction atom (Tree A) highlighted
4. **Traverse over time** — RAF walk along interaction path: clone registry → customer atom → agent atom → interaction MMR tip (video-like, ~8–12s loop)
5. **Absences** — empty space between trees is signal (two trees before bagging)
6. **Axes (optional labels)** — X = voice×voice · Y = turn order · Z = tree depth (schematic)

## Data bind (Braintona)

- `GET /api/demo/two-avatar-call/latest` → customer + agent leaves + interaction MMR
- `GET /api/demo/voice-clone/latest` → clone registry atom (optional parent)
- Technical `#graphPanel` is **not** the stage figure

## Claim ceiling

Schematic presentation of labeled AI voice custody atoms. Not biometrics, not deepfake detection, not science truth. Technical graph remains the review artifact.
