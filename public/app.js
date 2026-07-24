const runBtn = document.getElementById("runBtn");
const speakBtn = document.getElementById("speakBtn");
const sourceEl = document.getElementById("source");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const evalOut = document.getElementById("evalOut");
const custodyOut = document.getElementById("custodyOut");
const steps = [...document.querySelectorAll("#steps li")];

let lastNarrate = "";
let lastAudio = null;

const DEFAULT_SOURCE =
  "Fractal Custody Objects bind sha256 of recorded bytes with domain separation (leaf 0x00, node 0x01). Custody proves provenance of a run, not scientific correctness. Glasswork selected the cheapest open model that cleared a pre-set quality bar on a gold claim-extraction task.";

sourceEl.value = DEFAULT_SOURCE;

function setStep(name, state) {
  const el = steps.find((s) => s.dataset.step === name);
  if (!el) return;
  el.classList.remove("active", "ok", "bad");
  if (state) el.classList.add(state);
}

function resetSteps() {
  for (const name of ["infer", "eval", "local", "daytona", "tamper"]) setStep(name, null);
}

runBtn.addEventListener("click", async () => {
  resetSteps();
  runBtn.disabled = true;
  speakBtn.disabled = true;
  statusEl.textContent = "Running Fireworks → Braintrust/local eval → Daytona…";
  setStep("infer", "active");

  try {
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: sourceEl.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "pipeline failed");

    setStep("infer", "ok");
    setStep("eval", data.eval.pass ? "ok" : "bad");
    setStep("local", data.verify_local.ok ? "ok" : "bad");
    setStep("daytona", data.daytona?.skipped ? "active" : data.daytona?.ok ? "ok" : "bad");
    setStep("tamper", data.tamper_verify && !data.tamper_verify.ok ? "ok" : "bad");

    evalOut.textContent = JSON.stringify(
      {
        backend: data.eval.backend,
        precision: Number(data.eval.precision.toFixed(3)),
        recall: Number(data.eval.recall.toFixed(3)),
        f1: Number(data.eval.f1.toFixed(3)),
        pass: data.eval.pass,
        model: data.model.id,
        mock: Boolean(data.model.mock),
        missed: data.eval.missed,
      },
      null,
      2,
    );

    custodyOut.textContent = JSON.stringify(
      {
        custody_root: data.receipt.custody_root,
        local_verify: data.verify_local.ok,
        daytona: data.daytona
          ? {
              ok: data.daytona.ok,
              skipped: data.daytona.skipped,
              sandbox_id: data.daytona.sandbox_id,
              reason: data.daytona.reason,
              recomputed_root: data.daytona.recomputed_root,
            }
          : null,
        tamper_rejected: data.tamper_verify ? !data.tamper_verify.ok : null,
        claim_ceilings: data.receipt.claim_ceilings,
      },
      null,
      2,
    );

    resultsEl.hidden = false;
    lastNarrate = data.narrate || "";
    speakBtn.disabled = !lastNarrate;
    statusEl.textContent = data.narrate || "Done.";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message || err}`;
    setStep("infer", "bad");
  } finally {
    runBtn.disabled = false;
  }
});

speakBtn.addEventListener("click", async () => {
  if (!lastNarrate) return;
  speakBtn.disabled = true;
  statusEl.textContent = "Requesting ElevenLabs narration…";
  try {
    const res = await fetch("/api/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lastNarrate }),
    });
    const data = await res.json();
    if (data.skipped) {
      statusEl.textContent = `Voice skipped: ${data.reason}`;
      // Web Speech fallback for demo continuity
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(lastNarrate);
        window.speechSynthesis.speak(u);
        statusEl.textContent = "Spoke via browser TTS (ElevenLabs key pending).";
      }
      return;
    }
    if (!data.ok) throw new Error(data.reason || "narrate failed");
    const audio = new Audio(`data:${data.content_type};base64,${data.audio_base64}`);
    lastAudio = audio;
    await audio.play();
    statusEl.textContent = "ElevenLabs narration playing.";
  } catch (err) {
    statusEl.textContent = `Narrate error: ${err.message || err}`;
  } finally {
    speakBtn.disabled = false;
  }
});


const voiceBtn = document.getElementById("voiceBtn");
const voicePanel = document.getElementById("voicePanel");
const voiceOut = document.getElementById("voiceOut");
if (voiceBtn) {
  voiceBtn.addEventListener("click", async () => {
    voiceBtn.disabled = true;
    statusEl.textContent = "Sealing human vs AI voice-origin FCG…";
    try {
      const res = await fetch("/api/voice-origin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lastNarrate || "Braintona custody verified." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "voice-origin failed");
      voiceOut.textContent = JSON.stringify(
        {
          human_count: data.human_count,
          ai_count: data.ai_count,
          mmr_root: data.graph?.mmr_root,
          verify: data.verify,
          mislabel_rejected: data.mislabel_rejected,
          elevenlabs: data.elevenlabs,
          note: data.note,
          method_doi: data.method_doi,
        },
        null,
        2,
      );
      voicePanel.hidden = false;
      statusEl.textContent = data.note || "Voice-origin sealed.";
    } catch (err) {
      statusEl.textContent = `Voice-origin error: ${err.message || err}`;
    } finally {
      voiceBtn.disabled = false;
    }
  });
}
