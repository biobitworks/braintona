# Dual-host demo record — Pro talent + Studio app

**Locked layout (2026-07-24)**

| Host | Role | What appears |
|---|---|---|
| **magicPRObox** | Talent booth | **You only**: face + mic. Prefer built-in **QuickTime → New Movie Recording** (OBS optional). Not the app UI. |
| **magicSTUDIObox** | Product stage | You **navigate the app** (wider screen). **Script on the left**; demo browser on the right. |

Final Devpost file = sync Studio screen capture + Pro face/voice (PiP in iMovie/CapCut/etc.).

**Drop folder (both hosts, gitignored):**  
`/Users/byron/projects/active/braintona/.planning/private/demo-record/`  
← `braintona-studio-ui.mov` · `braintona-pro-talent.mov` (after Desktop save).

---

## A. magicSTUDIObox (app + script)

### 1. Layout (use the extra screen room)

```
┌──────────────── Studio display ────────────────┐
│  LEFT (~1/3)          │  RIGHT (~2/3)          │
│  Script / shot list   │  Browser demo          │
│  (Notes or TextEdit)   │  127.0.0.1:8787        │
│                       │  star chart → 2-avatar │
└────────────────────────────────────────────────┘
```

- Left: this file’s shot list (or `docs/PITCH_PACK.md` §7) in Notes — large type.
- Right: Safari/Chrome **only** the demo (hide bookmarks bar). Prefer fullscreen on the browser pane if you use Split View.

### 2. Start Braintona

```bash
cd /Users/byron/projects/active/braintona
git pull   # if Pro authored latest
set -a && source .env && set +a
fireconnect cursor off   # conserve Fireworks
npm run start
# open http://127.0.0.1:8787/demo-voice-star.html
```

Warm once before record: **Play traverse** on star chart → open `/demo-two-turn.html` or two-avatar → confirm audio plays.

### 3. Capture Studio screen (product reel)

On Studio: **⌘⌃⇧5** → Options → **Save to: Desktop** → Record Selected Portion (right 2/3 browser) **or** entire display.  
Mic on Studio: **off** (voice comes from Pro).

**Save paths (Studio):**

| Step | Path |
|---|---|
| First land | `~/Desktop/braintona-studio-ui.mov` |
| Then move | `/Users/byron/projects/active/braintona/.planning/private/demo-record/braintona-studio-ui.mov` |

```bash
mkdir -p /Users/byron/projects/active/braintona/.planning/private/demo-record
mv ~/Desktop/braintona-studio-ui.mov /Users/byron/projects/active/braintona/.planning/private/demo-record/
```

---

## B. magicPRObox (you only — face + audio)

### Preferred: QuickTime (built-in, no OBS)

1. Open **QuickTime Player**
2. **File → New Movie Recording**
3. Click the ▼ next to the record button → pick **FaceTime camera** + **MacBook mic** (or USB mic)
4. Frame head+shoulders; leave the QuickTime window as your “monitor” (it won’t be in the Studio UI reel)
5. Hit the red **Record** when Studio click-through starts
6. **File → Stop Recording** → save paths below

That’s face + mic only. Do **not** use New Screen Recording here for the talent track.

**Save paths (Pro):**

| Step | Path |
|---|---|
| First land | `~/Desktop/braintona-pro-talent.mov` |
| Then move | `/Users/byron/projects/active/braintona/.planning/private/demo-record/braintona-pro-talent.mov` |

```bash
mkdir -p /Users/byron/projects/active/braintona/.planning/private/demo-record
mv ~/Desktop/braintona-pro-talent.mov /Users/byron/projects/active/braintona/.planning/private/demo-record/
```

### Optional: OBS

Use OBS only if you want levels meters / scene switching. Same rule: Video Capture + Mic only — no app Display Capture on Pro.

### Script cue (optional on Pro)

iPhone teleprompter or tiny Notes **off-camera**. Click script stays on **Studio left**.

---

## C. Combine into one &lt;2m Devpost video

**Simple (recommended today):**

1. Drop `braintona-studio-ui.mov` + `braintona-pro-talent.mp4` into **Final Cut / iMovie / CapCut / DaVinci**
2. Timeline: **full-frame Studio UI**; **PiP** Pro face (corner, ~20% width)
3. Audio: **Pro mic only**; mute Studio
4. Trim to storyboard (star chart traverse → two-avatar → repo URL)
5. Export 1280×720+ H.264 → upload Devpost

**Alt — live composite in OBS on Pro:**

1. On Pro: System Settings → Screen Sharing / open **vnc://magicSTUDIObox.local** (or Screens / Jump Desktop) showing Studio desktop  
2. OBS on Pro: Scene = **Window Capture** (that Screen Sharing window) + **Video Capture** (you, PiP) + mic  
3. Single recording file — higher setup cost; only if you’re comfortable before 15:30

---

## D. Shot list (Studio right / you speak on Pro)

| Time | Studio clicks | You say (Pro mic) |
|---|---|---|
| 0:00–0:12 | `/pitch.html` | Gaps / fail closed |
| 0:12–0:35 | `/` Run pipeline | Fireworks → Braintrust → FCO |
| 0:35–0:55 | Daytona ✓ → tamper ✗ | Second machine; fail closed |
| 0:55–1:10 | Token trace | Sponsor points of contact |
| 1:10–1:35 | `/demo-voice-star.html` Play | Customer atom glints; traverse |
| 1:35–1:50 | Two-avatar audio | Two leaves; vault tip private |
| 1:50–2:00 | Repo URL on screen | github.com/biobitworks/braintona |

---

## E. Preflight checklist

- [ ] Studio: demo warm (star + two-avatar audio OK)  
- [ ] Studio: script left, browser right; mic off  
- [ ] Pro: QuickTime **New Movie Recording** (cam + mic); or OBS if preferred  

- [ ] Clocks roughly synced (start both recordings on a countdown)  
- [ ] No `.env`, no Cursor secrets, no notifications (Focus mode both Macs)  
- [ ] Export one file &lt;2 min → Devpost  

**Claim ceiling on camera:** custody of bytes, not scientific truth; voice labels ≠ biometrics.

---

## F. Post edit with ElevenLabs (OPERATOR GO 2026-07-24)

When Byron drops links to the raw clips, the agent **may edit as needed using ElevenLabs**:

- Clean / replace narration with TTS (prefer Byron clone `ELEVENLABS_VOICE_ID_CLONE` or customer voice id)
- Keep Studio UI reel as ground truth for clicks
- If narration is TTS: label honestly in Devpost/description as AI stand-in where relevant; seal optional voice-origin FCO (`content_class=ai`)
- Do **not** claim the ElevenLabs track is a live human mic recording
- Final export still &lt;2 min for Devpost

Raw links → bank in `.planning/private/demo-record/` receipts + `docs/PITCH_PACK.md` when provided.
