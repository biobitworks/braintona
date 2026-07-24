# Braintona — video teleprompter (<2 min)

**Rule:** Seeds of truth sealed into app FCG *before* this file was compiled.
**Bag tip:** `sha256:bc4e148b655eb15ae53a477c75eef4cbd10e8257cd18af1646667a693a2d87da`
**SoT:** `.planning/quick/260724-braintona-hacksprint/demo_script_seeds/`
**UI path:** pitch → pipeline → star → two-turn → finish (`Next page` only)
**Studio mic OFF.** Speak on Pro.

---

## How to (once)

```bash
cd /Users/byron/projects/active/braintona
set -a && source .env && set +a
fireconnect cursor off
npm run start
# re-seal seeds if you edit say text:
python3 scripts/seal_demo_script_seeds.py
python3 scripts/update_fcg_bag.py
```

1. Left: this file · Right: http://127.0.0.1:8787/pitch.html
2. Warm pipeline + star traverse + two-turn audio
3. Studio ⌘⌃⇧5 · Pro QuickTime Movie Recording · countdown
4. Save clips → `.planning/private/demo-record/` → combine → Devpost

---

## Continuous read (compiled from seeds only)

Brackets = clicks. Every spoken line cites a sealed seed leaf.

---

**[pitch.html — talk only]** · `S01_handoff_gap` · `sha256:81b0831fb2a6…` · `S02_custody_contract` · `sha256:edf980543d5b…`

Agents already answer. [pause] The next person still re-checks everything. [pause] That's the handoff gap.
Braintona fills it with a custody contract. [pause] And we tell you exactly where that contract stops.

`S03_gap_same_box` · `sha256:02a656b6ac93…` · `S04_gap_unlabeled_voice` · `sha256:a88c27c49011…`

Two gaps you'll see live. [pause] First. Same-box verify. When the runner checks itself.
Second. Unlabeled voice. [pause] When customer and agent audio look the same in the logs.

**[Next → / · Run live pipeline]** · `S05_pipeline_stack` · `sha256:8bf68f43eb49…` · `S06_daytona_fail_closed` · `sha256:c2ff2058e0f3…` · `S07_sponsor_fingerprints` · `sha256:204b518e5004…`

Watch the stack work. [pause] Fireworks extracts. Braintrust scores. We seal an FCO root.
Then a second machine. Daytona. [pause] Recomputes that root. Match is green. [pause] Tamper the receipt and we fail closed. Bad custody dies here. [pause] That's gap one closed. Attestation is independent. Not the same box checking itself.
While this runs, every sponsor hop leaves a signature. [pause] Fireworks. Braintrust. Daytona. [pause] Fingerprints. Not a logo wall.

**[Next → /demo-voice-star.html · Play traverse]** · `S08_voice_star_traverse` · `sha256:4575a552b6c9…`

Gap two. Voice. [pause] The customer atom glints gold. [pause] We walk clone. To customer. To agent. To the interaction tip. [pause] Two trees before they bag. Customer stays distinct.

**[Next → /demo-two-turn.html · Run two-turn demo]** · `S09_two_leaves_vault` · `sha256:6cf67a288dfc…`

Hear it. Customer leaf. Agent leaf. [pause] Labels explicit. Not a deepfake score. [pause] The customer tip stays vault-private. [pause] Lose the vault, lose private authority. By design.

**[Finish]** · `S10_ceiling_close` · `sha256:5e5c7a34553b…`

We don't claim the answer is true. [pause] We claim custody of the recorded bytes. [pause] github.com/biobitworks/braintona. [pause] Fill the handoff gap. Fail closed.

**[Stop both recordings]**

---

## Seed index (FCG atoms)

| Ord | Seed | Proves | Leaf |
|---|---|---|---|
| 1 | `S01_handoff_gap` | problem | `sha256:81b0831fb2a632d791a93642324d262f2a231366ee1a0a4a080bcebda5a3db70` |
| 2 | `S02_custody_contract` | thesis | `sha256:edf980543d5bc10d8b1f5832db3874b72bceebce767068541fbe8ec157b56686` |
| 3 | `S03_gap_same_box` | gap_1_named | `sha256:02a656b6ac931f533573b891cb77d3f0d333e67a4e6d9563786fd9b42d848ffc` |
| 4 | `S04_gap_unlabeled_voice` | gap_2_named | `sha256:a88c27c490119986b560ded670bab85018013c47e68f9bd18992aa72597af9e6` |
| 5 | `S05_pipeline_stack` | live_pipeline | `sha256:8bf68f43eb49281f89b4e676a8d728b81b5510a8d4923d6878384d78de07ec74` |
| 6 | `S06_daytona_fail_closed` | gap_1_closed | `sha256:c2ff2058e0f314fd722bebc2de21fcab920c0ef33afc7f9d39ecee2ae341b5c0` |
| 7 | `S07_sponsor_fingerprints` | sponsor_points_of_contact | `sha256:204b518e5004eb66d32ad8223aa161c5cb3716ab40e232ebccc094a6eedd63af` |
| 8 | `S08_voice_star_traverse` | gap_2_visual | `sha256:4575a552b6c9a377be3f143666e9c3669d5feab964f302efc899e783ac769f5c` |
| 9 | `S09_two_leaves_vault` | gap_2_closed | `sha256:6cf67a288dfc48bf4e12bff64fede933102b111fc3bc6068ef90ef81cf295d49` |
| 10 | `S10_ceiling_close` | ceiling_and_close | `sha256:5e5c7a34553b325728b5174ea0002a836ec10bec7f6ba40935db4628284164e3` |

**MMR tip:** `sha256:bc4e148b655eb15ae53a477c75eef4cbd10e8257cd18af1646667a693a2d87da`

---

## If something breaks

| Glitch | Keep talking (still under seed ceilings) |
|---|---|
| Daytona slow | Local verify green; tamper still fails closed. (`S06`) |
| Eval F1 red | Eval scores quality; custody scores integrity. (`S05` ceiling) |
| No audio | Skip hear-it; two labeled leaves; tip vault-private. (`S09`) |
| Behind clock | Drop `S07` sentence; keep S05→S06→S08→S10 |
