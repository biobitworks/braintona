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

/** Demo voice lock — must match .env / Studio */
const DEMO_VOICES = {
  customer_voice_id: "5niL0Wu395iXN1uc4zne",
  agent_voice_id: "IQjnnInWsKbdAesop75D",
  customer_name: "Byron",
  agent_name: "Library",
  clone_voice_id: "5niL0Wu395iXN1uc4zne",
};

let lastNarrate = "";
let lastAudio = null;

const DEFAULT_SOURCE =
  "Fractal Custody Objects bind sha256 of recorded bytes with domain separation (leaf 0x00, node 0x01). Custody proves provenance of a run, not scientific correctness. Glasswork selected the cheapest open model that cleared a pre-set quality bar on a gold claim-extraction task.";

if (sourceEl) sourceEl.value = DEFAULT_SOURCE;

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

/** Keep graph readable: session + last 2 runs (+ private tip). Full history stays in API. */
function focusGraph(graph) {
  const nodes = graph.nodes || [];
  const edges = graph.edges || [];
  const runs = nodes.filter((n) => n.kind === "run");
  const keepRuns = new Set(runs.slice(-2).map((n) => n.id));
  const keep = new Set();
  for (const n of nodes) {
    if (n.kind === "session" || n.kind === "conversation_private" || n.kind === "voice_origin") {
      keep.add(n.id);
    }
  }
  for (const id of keepRuns) keep.add(id);
  // Walk edges from kept runs to their leaves / eval / daytona / tamper
  let grew = true;
  while (grew) {
    grew = false;
    for (const e of edges) {
      if (keep.has(e.from) && !keep.has(e.to)) {
        keep.add(e.to);
        grew = true;
      }
    }
  }
  return {
    ...graph,
    nodes: nodes.filter((n) => keep.has(n.id)),
    edges: edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    _focus: { shown_runs: keepRuns.size, total_runs: graph.run_count },
  };
}

function layoutGraph(graph) {
  const nodes = graph.nodes || [];
  const width = 920;
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
    "voice_origin",
    "conversation_private",
  ];
  const pos = new Map();
  let maxY = 40;
  lanes.forEach((kind, row) => {
    const list = byKind[kind] || [];
    list.forEach((n, i) => {
      const x = list.length === 1 ? width / 2 : 60 + (i * (width - 120)) / Math.max(1, list.length - 1);
      const y = 40 + row * 42;
      maxY = Math.max(maxY, y + 28);
      pos.set(n.id, { x, y, n });
    });
  });
  let extraRow = lanes.length;
  for (const n of nodes) {
    if (pos.has(n.id)) continue;
    const y = 40 + extraRow * 42;
    maxY = Math.max(maxY, y + 28);
    pos.set(n.id, { x: 80 + (extraRow % 8) * 100, y, n });
    extraRow += 1;
  }
  return { pos, width, height: Math.max(280, maxY + 24) };
}

function renderGraph(graph) {
  if (!graphSvg || !graphMeta) return;
  const focused = focusGraph(graph);
  const { pos, width, height } = layoutGraph(focused);
  graphSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  graphSvg.style.minHeight = `${Math.min(520, height)}px`;
  const lines = (focused.edges || [])
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
  const fr = focused._focus || {};
  graphMeta.textContent = `${graph.run_count} runs total · showing last ${fr.shown_runs || 0} · ${focused.nodes.length} nodes · ${focused.edges.length} edges · root ${String(graph.bagged_session_root || "").slice(0, 16)}…`;
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

if (runBtn) runBtn.addEventListener("click", async () => {
  resetSteps();
  runBtn.disabled = true;
  if (speakBtn) speakBtn.disabled = true;
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

if (speakBtn) speakBtn.addEventListener("click", async () => {
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
    traceToken.textContent = `token ${trace.token_id} · sig tip ${String(trace.signature_chain_tip || "").slice(0, 16)}…`;
  }
  if (traceMeta) {
    const nFcg = (trace.fcg?.matched_artifacts || []).length;
    const nActors = (trace.actors_seen || []).length;
    traceMeta.textContent = `${trace.hops.length} touches · ${nActors} actors · FCG binds ${nFcg} · tip ${String(trace.signature_chain_tip || "").slice(0, 12)}…`;
  }
  const sigSummary = document.getElementById("sigSummary");
  if (sigSummary) {
    const actors = (trace.actors_seen || [])
      .map((a) => `${a.actor_class}:${a.actor_id.split("/").pop()}×${a.touches}`)
      .join(" · ");
    sigSummary.hidden = false;
    sigSummary.textContent = `Actors in combine order tip: ${actors}`;
  }
  traceHopsEl.innerHTML = "";
  for (const hop of trace.hops) {
    const li = document.createElement("li");
    li.className = `status-${hop.status}`;
    li.dataset.idx = String(hop.idx);
    const sig = hop.signature || {};
    const poc = hop.point_of_contact || {};
    const actorClass = sig.actor_class || "custody_runtime";
    li.innerHTML = `
      <span class="hop-idx">${String(hop.idx).padStart(2, "0")}</span>
      <div>
        <div class="hop-sponsor">${hop.sponsor} <span class="hop-surface">/ ${hop.surface} · ${hop.status}</span></div>
        <div class="hop-bind">${hop.binding}</div>
        <div class="hop-bind">${hop.detail}</div>
        <div class="sig-strip">
          <div><span class="actor-${actorClass}">${actorClass}</span> · ${sig.actor_id || "?"} · ${sig.role || ""}</div>
          <div>sig ${String(sig.signature_hash || "").slice(0, 16)}… · ${sig.signature_id || ""}</div>
          <div class="poc">PoC: ${poc.label || "—"} · ${poc.combine_op || ""}</div>
          <div class="poc">${String(poc.prior_combined || "").slice(0, 12)} <span class="combine-arrow">⊕</span> ${String(poc.touch_leaf || "").slice(0, 12)} <span class="combine-arrow">→</span> ${String(poc.combined_after || "").slice(0, 12)}</div>
          ${hop.in_fcg ? `<div class="hop-fcg">FCG contact ← ${hop.fcg_artifact || poc.fcg_artifact || "bag"}</div>` : `<div class="hop-fcg">observe/pointer — outside FCG bag combine</div>`}
        </div>
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


const twoAvatarBtn = document.getElementById("twoAvatarBtn");
const twoAvatarPanel = document.getElementById("twoAvatarPanel");
const twoAvatarOut = document.getElementById("twoAvatarOut");
const twoAvatarMeta = document.getElementById("twoAvatarMeta");
const twoAvatarPlayers = document.getElementById("twoAvatarPlayers");
if (twoAvatarBtn) {
  twoAvatarBtn.addEventListener("click", async () => {
    twoAvatarBtn.disabled = true;
    statusEl.textContent = "Synthesizing Byron (customer) + Library (agent) via ElevenLabs…";
    try {
      const res = await fetch("/api/demo/two-avatar-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_VOICES),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "two-avatar demo failed");
      if (twoAvatarMeta) {
        twoAvatarMeta.textContent = `${data.interaction_id} · TreeA ${String(data.tree_a_tip).slice(0,12)}… · TreeB ${String(data.tree_b_tip).slice(0,12)}… · MMR ${String(data.interaction_mmr_root).slice(0,12)}… · vault root private`;
      }
      if (twoAvatarPlayers) {
        twoAvatarPlayers.innerHTML = (data.turns || [])
          .map(
            (t) => `<figure>
              <figcaption>${t.role === "customer" ? "Tree A · Customer" : "Tree B · Agent"} — ${t.avatar_name}</figcaption>
              <audio controls src="/assets/voice/${t.audio_path.split("/").pop()}"></audio>
              <div class="hop-bind">voice ${t.voice_id} · ${t.audio_bytes} B · leaf ${String(t.receipt?.leaf_hash || "").slice(0, 16)}…</div>
            </figure>`,
          )
          .join("");
      }
      if (twoAvatarOut) {
        twoAvatarOut.textContent = JSON.stringify(
          {
            interaction_id: data.interaction_id,
            tree_a_tip: data.tree_a_tip,
            tree_b_tip: data.tree_b_tip,
            interaction_mmr_root: data.interaction_mmr_root,
            customer_vault_root: data.customer_vault_root,
            elevenlabs: data.elevenlabs,
            claim_ceiling: data.claim_ceiling,
            note: data.note,
          },
          null,
          2,
        );
      }
      if (twoAvatarPanel) twoAvatarPanel.hidden = false;
      statusEl.textContent = data.note || "Two-avatar call sealed.";
    } catch (err) {
      const msg = err?.message || String(err);
      const hint =
        msg === "Load failed" || msg === "Failed to fetch"
          ? " — server not reachable on :8787 (run: npm run start)"
          : "";
      statusEl.textContent = `Two-avatar error: ${msg}${hint}`;
    } finally {
      twoAvatarBtn.disabled = false;
    }
  });
}

const cloneBtn = document.getElementById("cloneBtn");
const clonePanel = document.getElementById("clonePanel");
const cloneOut = document.getElementById("cloneOut");
const cloneMeta = document.getElementById("cloneMeta");
const cloneStrip = document.getElementById("cloneStrip");
const clonePlayer = document.getElementById("clonePlayer");
if (cloneBtn) {
  cloneBtn.addEventListener("click", async () => {
    cloneBtn.disabled = true;
    statusEl.textContent = "Sealing voice clone as FCO + AI utterance…";
    try {
      const res = await fetch("/api/demo/voice-clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_id: DEMO_VOICES.clone_voice_id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "voice-clone failed");
      const hs = data.hash_strip || {};
      if (cloneMeta) {
        cloneMeta.textContent = `${hs.display_name || "clone"} · voice ${hs.voice_id} · class ${hs.content_class}`;
      }
      if (cloneStrip) {
        cloneStrip.innerHTML = `
          <span class="pill ai">AI clone</span>
          <span>voice <code>${hs.voice_id || ""}</code></span>
          <span>clone_leaf <code>${hs.clone_leaf || ""}…</code></span>
          <span>utt_leaf <code>${hs.utterance_leaf || "—"}…</code></span>
          <span>mmr <code>${hs.mmr_root || ""}…</code></span>
        `;
      }
      if (clonePlayer && data.audio_path) {
        const file = data.audio_path.split("/").pop();
        clonePlayer.innerHTML = `<figure>
          <figcaption>Clone utterance · content_class=ai</figcaption>
          <audio controls src="/assets/voice/${file}"></audio>
          <div class="hop-bind">${data.audio_bytes || 0} B · parent clone leaf</div>
        </figure>`;
      }
      if (cloneOut) {
        cloneOut.textContent = JSON.stringify(
          {
            clone_node: data.clone?.node_id,
            clone_leaf: data.clone?.leaf_hash,
            fco_root: data.clone?.fco_root,
            utterance_leaf: data.utterance?.leaf_hash,
            mmr_root: data.mmr_root,
            elevenlabs_ok: data.elevenlabs_ok,
            claim_ceiling: data.claim_ceiling,
            note: data.note,
          },
          null,
          2,
        );
      }
      if (clonePanel) clonePanel.hidden = false;
      statusEl.textContent = data.note || "Voice clone sealed.";
    } catch (err) {
      statusEl.textContent = `Voice clone error: ${err.message || err}`;
    } finally {
      cloneBtn.disabled = false;
    }
  });
}


/* CopilotKit FCO cockpit */
const copilotMeta = document.getElementById("copilotMeta");
const copilotText = document.getElementById("copilotText");
const copilotOut = document.getElementById("copilotOut");
const copilotHumanBtn = document.getElementById("copilotHumanBtn");
const copilotAiBtn = document.getElementById("copilotAiBtn");

async function refreshCopilotStatus() {
  if (!copilotMeta) return;
  try {
    const res = await fetch("/api/copilotkit/status");
    const data = await res.json();
    copilotMeta.textContent = data.license_present
      ? "License present · org-linked · seal turns below"
      : "License missing — run: bash scripts/copilotkit_org_bootstrap.sh (login → pick org → license --write)";
  } catch (err) {
    copilotMeta.textContent = `Status error: ${err.message || err}`;
  }
}

async function sealCopilotTurn(actor) {
  const text = (copilotText?.value || "").trim();
  if (!text) {
    statusEl.textContent = "Enter an operator turn first.";
    return;
  }
  const res = await fetch("/api/copilotkit/seal-turn", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, actor }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "seal-turn failed");
  if (copilotOut) {
    copilotOut.textContent = JSON.stringify(
      {
        interaction_id: data.thread.interaction_id,
        turns: data.thread.turns.length,
        interaction_mmr_root: data.thread.interaction_mmr_root,
        license_present: data.thread.license_present,
        last_turn: data.thread.turns[data.thread.turns.length - 1],
        claim_ceiling: data.thread.claim_ceiling,
      },
      null,
      2,
    );
  }
  statusEl.textContent = `CopilotKit turn sealed · MMR ${String(data.thread.interaction_mmr_root).slice(0, 12)}…`;
  await refreshCopilotStatus();
}

if (copilotHumanBtn) {
  copilotHumanBtn.addEventListener("click", async () => {
    try {
      await sealCopilotTurn("operator");
    } catch (err) {
      statusEl.textContent = `CopilotKit error: ${err.message || err}`;
    }
  });
}
if (copilotAiBtn) {
  copilotAiBtn.addEventListener("click", async () => {
    try {
      const prior = (copilotText?.value || "").trim() || "operator asked for custody status";
      if (copilotText) {
        copilotText.value = `Custody tip acknowledged for: ${prior.slice(0, 120)}. Provenance only — not correctness.`;
      }
      await sealCopilotTurn("ai");
    } catch (err) {
      statusEl.textContent = `CopilotKit error: ${err.message || err}`;
    }
  });
}
refreshCopilotStatus();


/* Sponsor strip — CodeRabbit featured */
const sponsorStrip = document.getElementById("sponsorStrip");
const sponsorMeta = document.getElementById("sponsorMeta");
const coderabbitSealBtn = document.getElementById("coderabbitSealBtn");
const coderabbitOut = document.getElementById("coderabbitOut");

const SPONSOR_CARDS = [
  { id: "coderabbit", name: "CodeRabbit", featured: true, job: "Review observer on public repo + Discord Path B", tip: "Seal observe hop · @coderabbitai on PR #3" },
  { id: "daytona", name: "Daytona", job: "Second-machine custody recompute", tip: "Pipeline → green / tamper red" },
  { id: "braintrust", name: "Braintrust", job: "Gold-task eval spans", tip: "Quality ≠ integrity" },
  { id: "fireworks", name: "Fireworks", job: "Claim extraction inference", tip: "glm-5p1 temp 0" },
  { id: "elevenlabs", name: "ElevenLabs", job: "Voice origin + two-avatar MMR", tip: "Actual vs AI labels" },
  { id: "copilotkit", name: "CopilotKit", job: "Operator FCO cockpit", tip: "Org → license → seal turns" },
  { id: "workos", name: "WorkOS", job: "Optional AuthKit identity", tip: "Not vault SoT" },
];

function renderSponsors(keys = {}) {
  if (!sponsorStrip) return;
  sponsorStrip.innerHTML = SPONSOR_CARDS.map((s) => {
    const live = keys[s.id];
    const liveBit = live === undefined ? "" : live ? " · key/live" : " · pending";
    return `<article class="sponsor-card${s.featured ? " featured" : ""}">
      <h3>${s.name}</h3>
      <p>${s.job}${liveBit}</p>
      <p>${s.tip}</p>
    </article>`;
  }).join("");
}

async function refreshSponsors() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    renderSponsors(data.keys || {});
    if (sponsorMeta) {
      sponsorMeta.textContent = data.coderabbit?.featured
        ? "CodeRabbit featured — each sponsor gets a named hop (see docs/SPONSOR_TOUCHES.md)"
        : "Sponsor strip";
    }
  } catch (err) {
    renderSponsors({});
  }
}

if (coderabbitSealBtn) {
  coderabbitSealBtn.addEventListener("click", async () => {
    coderabbitSealBtn.disabled = true;
    try {
      const res = await fetch("/api/coderabbit/seal-observe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surface: "github_pr_bot",
          pr_number: 3,
          pr_url: "https://github.com/biobitworks/braintona/pull/3",
          event: "featured_observe_seal",
          note: "CodeRabbit Best Use lane — observe hop for HackSprint demo",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "seal-observe failed");
      if (coderabbitOut) coderabbitOut.textContent = JSON.stringify(data.receipt, null, 2);
      statusEl.textContent = `CodeRabbit observe sealed · ${String(data.receipt.leaf_hash).slice(0, 12)}…`;
      await refreshSponsors();
    } catch (err) {
      statusEl.textContent = `CodeRabbit error: ${err.message || err}`;
    } finally {
      coderabbitSealBtn.disabled = false;
    }
  });
}
refreshSponsors();
