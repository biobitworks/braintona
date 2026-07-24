const runBtn = document.getElementById("runBtn");
const speakBtn = document.getElementById("speakBtn");
const sourceEl = document.getElementById("source");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const evalOut = document.getElementById("evalOut");
const custodyOut = document.getElementById("custodyOut");
const graphMeta = document.getElementById("graphMeta");
const graphSvg = document.getElementById("graphSvg");
const steps = [...document.querySelectorAll("#steps li")];

let lastNarrate = "";
let lastAudio = null;

const DEFAULT_SOURCE =
  "Fractal Custody Objects bind sha256 of recorded bytes with domain separation (leaf 0x00, node 0x01). Custody proves provenance of a run, not scientific correctness. Glasswork selected the cheapest open model that cleared a pre-set quality bar on a gold claim-extraction task.";

sourceEl.value = DEFAULT_SOURCE;

const KIND_COLOR = {
  session: "#d9ff4a",
  run: "#3dffb5",
  ops_leaf: "#7ec8ff",
  content_leaf: "#b39dff",
  custody_root: "#ff9f43",
  eval: "#3dffb5",
  daytona: "#d9ff4a",
  tamper: "#ff6b4a",
  voice_origin: "#ff8ad8",
  conversation_private: "#c4b5a0",
};

function setStep(name, state) {
  const el = steps.find((s) => s.dataset.step === name);
  if (!el) return;
  el.classList.remove("active", "ok", "bad");
  if (state) el.classList.add(state);
}

function resetSteps() {
  for (const name of ["infer", "eval", "local", "daytona", "tamper", "graph"]) setStep(name, null);
}

function layoutGraph(graph) {
  const nodes = graph.nodes || [];
  const width = 920;
  const height = 320;
  const byKind = {};
  for (const n of nodes) {
    (byKind[n.kind] ||= []).push(n);
  }
  const lanes = [
    "session",
    "run",
    "ops_leaf",
    "content_leaf",
    "custody_root",
    "eval",
    "daytona",
    "tamper",
  ];
  const pos = new Map();
  lanes.forEach((kind, row) => {
    const list = byKind[kind] || [];
    list.forEach((n, i) => {
      const x = list.length === 1 ? width / 2 : 60 + (i * (width - 120)) / Math.max(1, list.length - 1);
      const y = 36 + row * 36;
      pos.set(n.id, { x, y, n });
    });
  });
  // Place any leftover kinds
  let extraRow = lanes.length;
  for (const n of nodes) {
    if (pos.has(n.id)) continue;
    pos.set(n.id, { x: 80 + (extraRow % 8) * 100, y: 36 + extraRow * 36, n });
    extraRow += 1;
  }
  return { pos, width, height };
}

function renderGraph(graph) {
  if (!graphSvg || !graphMeta) return;
  const { pos, width, height } = layoutGraph(graph);
  graphSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const lines = (graph.edges || [])
    .map((e) => {
      const a = pos.get(e.from);
      const b = pos.get(e.to);
      if (!a || !b) return "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="g-edge" />`;
    })
    .join("");
  const dots = [...pos.values()]
    .map(({ x, y, n }) => {
      const fill = KIND_COLOR[n.kind] || "#e8f7f4";
      const label = (n.label || n.kind).replace(/[<>&]/g, "");
      const short = (n.short || "").toString().replace(/[<>&]/g, "").slice(0, 18);
      return `<g class="g-node" data-kind="${n.kind}">
        <circle cx="${x}" cy="${y}" r="8" fill="${fill}" />
        <text x="${x + 12}" y="${y - 4}" class="g-label">${label}</text>
        <text x="${x + 12}" y="${y + 10}" class="g-short">${short}</text>
      </g>`;
    })
    .join("");
  graphSvg.innerHTML = `${lines}${dots}`;
  graphMeta.textContent = `${graph.run_count} runs · ${graph.nodes.length} nodes · ${graph.edges.length} edges · session root ${String(graph.bagged_session_root || "").slice(0, 16)}…`;
  graphMeta.classList.add("pulse");
  setTimeout(() => graphMeta.classList.remove("pulse"), 700);
}

async function refreshGraph(preferred) {
  try {
    if (preferred) {
      renderGraph(preferred);
      setStep("graph", "ok");
      return preferred;
    }
    const res = await fetch("/api/graph");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "graph failed");
    renderGraph(data);
    setStep("graph", data.run_count > 0 ? "ok" : "active");
    return data;
  } catch (err) {
    if (graphMeta) graphMeta.textContent = `Graph error: ${err.message || err}`;
    setStep("graph", "bad");
    return null;
  }
}

runBtn.addEventListener("click", async () => {
  resetSteps();
  runBtn.disabled = true;
  speakBtn.disabled = true;
  statusEl.textContent = "Running Fireworks → Braintrust/local eval → Daytona → graph…";
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
        session_graph: data.graph
          ? {
              run_count: data.graph.run_count,
              bagged_session_root: data.graph.bagged_session_root,
              nodes: data.graph.nodes.length,
              edges: data.graph.edges.length,
            }
          : null,
        claim_ceilings: data.receipt.claim_ceilings,
      },
      null,
      2,
    );

    await refreshGraph(data.graph);
    if (data.token_trace) await renderTokenTrace(data.token_trace, { animate: true });
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
      if (voiceOut) {
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
      }
      if (voicePanel) voicePanel.hidden = false;
      statusEl.textContent = data.note || "Voice-origin sealed.";
      await refreshGraph();
    } catch (err) {
      statusEl.textContent = `Voice-origin error: ${err.message || err}`;
    } finally {
      voiceBtn.disabled = false;
    }
  });
}


const traceHopsEl = document.getElementById("traceHops");
const traceMeta = document.getElementById("traceMeta");
const traceToken = document.getElementById("traceToken");
const traceBtn = document.getElementById("traceBtn");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function renderTokenTrace(trace, { animate = true } = {}) {
  if (!trace || !traceHopsEl) return;
  if (traceToken) {
    traceToken.textContent = `token ${trace.token_id} · content_leaf ${String(trace.content_leaf).slice(0, 16)}…`;
  }
  if (traceMeta) {
    const nFcg = (trace.fcg?.matched_artifacts || []).length;
    traceMeta.textContent = `${trace.hops.length} hops · FCG artifacts bound ${nFcg} · session ${String(trace.bagged_session_root || "").slice(0, 12)}…`;
  }
  traceHopsEl.innerHTML = "";
  for (const hop of trace.hops) {
    const li = document.createElement("li");
    li.className = `status-${hop.status}`;
    li.dataset.idx = String(hop.idx);
    li.innerHTML = `
      <span class="hop-idx">${String(hop.idx).padStart(2, "0")}</span>
      <div>
        <div class="hop-sponsor">${hop.sponsor} <span class="hop-surface">/ ${hop.surface} · ${hop.status}</span></div>
        <div class="hop-bind">${hop.binding}</div>
        <div class="hop-bind">${hop.detail}</div>
        ${hop.in_fcg ? `<div class="hop-fcg">FCG ← ${hop.fcg_artifact || "bag"}</div>` : `<div class="hop-fcg">outside FCG bag (sponsor pointer)</div>`}
      </div>`;
    traceHopsEl.appendChild(li);
    if (animate) {
      await sleep(140);
      li.classList.add("visible", "active-hop");
      await sleep(90);
      li.classList.remove("active-hop");
    } else {
      li.classList.add("visible");
    }
  }
}

async function loadLatestTrace(animate = false) {
  try {
    const res = await fetch("/api/trace/latest");
    if (!res.ok) return null;
    const trace = await res.json();
    await renderTokenTrace(trace, { animate });
    return trace;
  } catch {
    return null;
  }
}

if (traceBtn) {
  traceBtn.addEventListener("click", () => loadLatestTrace(true));
}

async function refreshWorkos() {
  try {
    const res = await fetch("/api/auth/status", { credentials: "include" });
    const data = await res.json();
    const chip = document.getElementById("workosUser");
    const login = document.getElementById("workosLogin");
    if (!chip || !login) return;
    if (data.enabled && data.authenticated && data.user) {
      chip.hidden = false;
      chip.textContent = data.user.email || data.user.id;
      login.textContent = "Sign out";
      login.href = "/logout";
    } else if (data.enabled) {
      chip.hidden = true;
      login.textContent = "WorkOS sign in";
      login.href = "/login";
    } else {
      chip.hidden = true;
      login.textContent = "WorkOS (set keys)";
      login.removeAttribute("href");
    }
  } catch (_) {}
}

refreshWorkos();
refreshGraph();
loadLatestTrace(false);
