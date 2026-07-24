# Demo edit: three paths → one file (via FCG)

**Lock:** `.planning/quick/260724-braintona-hacksprint/DEMO_EDIT_THREE_PATH_LOCK.json`

## The three paths

| Path | Drop | `content_class` | Job |
|---|---|---|---|
| **P1 UI silent** | `braintona-studio-ui.mov` | `other` (screen) | Clicks / star / two-turn picture. Mic off. |
| **P2 Human VO** | `braintona-vo-script.*` | `human` | Read sealed script seeds. Hold at `[pause]` for cuts. |
| **P3 ElevenLabs gaps** | `braintona-vo-gap-*.mp3` | `ai` | Fill only pause/missing beats. Prefer Byron clone. |

Merge: full-frame **P1** + audio from **P2**, with **P3** spliced only into gap windows → one &lt;2m Devpost mp4.

## When / how (must show in FCG)

1. **Before any TTS:** human VO and UI hashes are banked (edit ledger row).
2. **When a gap needs fill:** generate ElevenLabs audio → seal `voice_origin` FCO (`content_class=ai`) → append to continuous ElevenLabs voice FCG tip (`parent_mmr_tip` → new `mmr_tip`).
3. **Ledger row** records: `gap_id`, which script `seed_id` it covers, intent `t_in`/`t_out`, `content_leaf`, `mmr_tip`.
4. **After timeline insert:** final export hash bags into the same edit FCG tip.

Viewer/judge can see: this beat was human; that beat was AI fill; tip grew here.

## Claim ceiling

Provenance of labeled audio + screen bytes. Not science truth. Not biometric ID. Do not present P3 as live human mic. Label AI stand-in in Devpost if P3 is audible.

## Operator steps

```bash
# after Pass A + Pass B land in .planning/private/demo-record/
# agent (post-GO): for each gap → ElevenLabs → seal voice FCO → edit timeline
# keep edit_fcg.jsonl append-only next to drops
```

App surfaces already used for the same rule: voice clone FCO, two-avatar leaves, continuous ElevenLabs voice FCG tip.
