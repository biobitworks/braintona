/**
 * Voice star chart — Cellico signal-layer style over Ship-of-Theseus.
 *
 * Theseus image = star field (do not invent cartoon balls).
 * Nodes = quiet soft disks + gold glint rings (bioviz signal-layer-media-module).
 * Labels = HTML rail only (never stacked on nodes).
 */
const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");
const hudStatus = document.getElementById("hudStatus");
const hudHighlight = document.getElementById("hudHighlight");
const hudMmr = document.getElementById("hudMmr");
const hudLeaves = document.getElementById("hudLeaves");
const playBtn = document.getElementById("playBtn");
const refreshBtn = document.getElementById("refreshBtn");

const reduced =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const ROLE_COPY = {
  clone: "Voice clone registry",
  customer: "Customer voice leaf",
  agent: "Agent voice leaf",
  mmr: "Interaction MMR tip",
};

/** Quiet field nodes — Cellico NETWORK_NODES density, no labels */
const FIELD = Array.from({ length: 52 }, (_, i) => {
  const arm = i % 4;
  const layer = Math.floor(i / 4);
  const theta = layer * 0.43 + arm * (Math.PI / 2) + Math.sin(i * 1.7) * 0.1;
  const radius = 0.14 + layer * 0.04 + ((i * 7) % 11) * 0.005;
  const skew = Math.sin(i * 0.31) * 0.1;
  return {
    id: `f-${i}`,
    role: "field",
    glint: false,
    x: Math.cos(theta) * radius + skew,
    y: Math.sin(theta) * radius * 0.82 + Math.cos(i * 0.19) * 0.08,
    z: Math.sin(theta * 1.35 + i * 0.17) * 0.44,
    cloud: 0.32 + Math.abs(Math.sin(i * 1.913 + 0.7)) * 0.45,
    radius: 2.8 + ((i * 5) % 9) * 0.35,
  };
});

let atoms = [];
let path = [];
let leafMeta = {};
let t = 0;
let playing = !reduced;
let raf = null;
let theseusImg = null;
let theseusReady = false;

(function loadTheseus() {
  const img = new Image();
  img.onload = () => {
    theseusImg = img;
    theseusReady = true;
  };
  img.src = "/assets/bioviz/ship-of-theseus-atlas-bg.png";
})();

function short(h, n = 12) {
  return String(h || "—").replace(/^sha256:/, "").slice(0, n);
}

function project(atom, angle, W, H) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const x3 = atom.x * c - atom.z * s;
  const z3 = atom.x * s + atom.z * c;
  const y3 = atom.y;
  const depth = (z3 + 1.2) / 2.4;
  const scale = 0.78 + depth * 0.48;
  return {
    x: W * 0.5 + x3 * W * 0.32 * scale,
    y: H * 0.52 - y3 * H * 0.32 * scale,
    z: z3,
    scale,
    depth,
  };
}

function fitCanvas() {
  const frame = canvas.parentElement;
  const w = Math.max(900, frame?.clientWidth || window.innerWidth);
  const h = Math.max(520, Math.min(780, Math.round(w * 0.56)));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function setCard(role, { name, leaf, voice }) {
  const card = document.getElementById(`card-${role}`);
  if (!card) return;
  const n = card.querySelector('[data-f="name"]');
  const l = card.querySelector('[data-f="leaf"]');
  const v = card.querySelector('[data-f="voice"]');
  if (n && name) n.textContent = name;
  if (l) l.textContent = leaf ? short(leaf, 14) + "…" : "—";
  if (v) v.textContent = voice ? short(voice, 16) : "—";
}

function highlightCard(role) {
  for (const el of document.querySelectorAll(".leaf-card")) {
    el.classList.toggle("on", el.dataset.role === role);
  }
}

function buildAtoms(bundle) {
  const list = FIELD.map((f) => ({ ...f }));
  const clone = bundle.clone;
  const turns = bundle.turns || [];
  const customer = turns.find((x) => x.role === "customer");
  const agent = turns.find((x) => x.role === "agent");

  leafMeta = {};

  if (clone?.leaf_hash || clone?.clone?.leaf_hash) {
    const leaf = clone.leaf_hash || clone.clone?.leaf_hash;
    const voice = clone.hash_strip?.voice_id || clone.clone?.envelope?.clone?.voice_id;
    const name = clone.display_name || clone.hash_strip?.display_name || "Byron clone";
    list.push({
      id: "clone",
      role: "clone",
      glint: false,
      x: -0.48,
      y: 0.22,
      z: -0.15,
      cloud: 0.55,
      radius: 5.5,
    });
    leafMeta.clone = { name, leaf, voice };
    setCard("clone", leafMeta.clone);
  }

  if (customer) {
    list.push({
      id: "customer",
      role: "customer",
      glint: true,
      x: -0.05,
      y: -0.05,
      z: 0.22,
      cloud: 0.7,
      radius: 6,
    });
    leafMeta.customer = {
      name: customer.avatar_name || "Customer",
      leaf: customer.receipt?.leaf_hash,
      voice: customer.voice_id,
    };
    setCard("customer", leafMeta.customer);
  }

  if (agent) {
    list.push({
      id: "agent",
      role: "agent",
      glint: false,
      x: 0.42,
      y: 0.12,
      z: 0.05,
      cloud: 0.55,
      radius: 5.8,
    });
    leafMeta.agent = {
      name: agent.avatar_name || "Agent",
      leaf: agent.receipt?.leaf_hash,
      voice: agent.voice_id,
    };
    setCard("agent", leafMeta.agent);
  }

  if (bundle.interaction_mmr_root) {
    list.push({
      id: "mmr",
      role: "mmr",
      glint: false,
      x: 0.12,
      y: -0.38,
      z: -0.18,
      cloud: 0.5,
      radius: 5.8,
    });
    leafMeta.mmr = { name: "MMR tip", leaf: bundle.interaction_mmr_root, voice: "" };
    setCard("mmr", leafMeta.mmr);
  }

  atoms = list;
  const idx = (id) => list.findIndex((a) => a.id === id);
  path = ["clone", "customer", "agent", "mmr"].map(idx).filter((i) => i >= 0);
  if (hudLeaves) hudLeaves.textContent = String(path.length);
  if (hudMmr) hudMmr.textContent = short(bundle.interaction_mmr_root || bundle.mmr_root) + "…";
}

function activePathIndex() {
  if (!path.length) return -1;
  const cycle = 720;
  return Math.min(path.length - 1, Math.floor(((t % cycle) / cycle) * path.length));
}

function drawTheseus(W, H) {
  if (theseusReady && theseusImg) {
    const iw = theseusImg.naturalWidth || theseusImg.width;
    const ih = theseusImg.naturalHeight || theseusImg.height;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(theseusImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#0c0d10";
    ctx.fillRect(0, 0, W, H);
  }
  // Light veil — keep Theseus stars visible (cellico-bio pitch rule)
  const veil = ctx.createRadialGradient(W * 0.52, H * 0.48, 40, W * 0.5, H * 0.5, W * 0.65);
  veil.addColorStop(0, "rgba(12, 13, 16, 0.22)");
  veil.addColorStop(0.55, "rgba(12, 13, 16, 0.38)");
  veil.addColorStop(1, "rgba(8, 5, 16, 0.55)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, W, H);
}

/** Cellico soft disk — not a metallic cartoon ball */
function drawSoftNode(p, atom, isHi, pulse) {
  const r = (atom.glint || isHi ? 10 : atom.radius) * p.scale * (isHi ? 1.05 : 1);
  const depth = p.depth;

  if (atom.glint || isHi) {
    const glowR = (52 + pulse * 18) * p.scale;
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, glowR);
    g.addColorStop(0, `rgba(240, 196, 90, ${0.75 * (0.45 + pulse * 0.55)})`);
    g.addColorStop(0.42, "rgba(232, 184, 74, 0.28)");
    g.addColorStop(1, "rgba(216, 166, 73, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 241, 190, ${0.55 + pulse * 0.3})`;
    ctx.lineWidth = 1.6 * p.scale;
    ctx.beginPath();
    ctx.arc(p.x, p.y, (20 + pulse * 6) * p.scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle =
    atom.glint || isHi ? "#f0c45a" : `rgba(122, 168, 184, ${0.42 + depth * 0.4})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();

  if (atom.glint || isHi) {
    ctx.fillStyle = "rgba(255, 248, 220, 0.95)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.6 * p.scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  fitCanvas();
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  drawTheseus(W, H);

  // quiet orbital shells (signal-layer ARK cues, muted)
  ctx.strokeStyle = "rgba(43, 198, 190, 0.28)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.52, W * 0.26, H * 0.18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(139, 156, 255, 0.22)";
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.52, W * 0.34, H * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(240, 196, 90, 0.18)";
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.52, W * 0.42, H * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();

  const angle = -0.4 + Math.sin(t * 0.005) * 0.22 + t * 0.0012;
  const projected = atoms.map((a) => project(a, angle, W, H));
  const hi = activePathIndex();
  const hiAtom = hi >= 0 ? atoms[path[hi]] : null;
  const hiId = hiAtom?.id || null;

  // disorder-context clouds
  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    const p = projected[i];
    const isHi = atom.id === hiId;
    const cueRadius = (14 + atom.cloud * 34) * p.scale;
    const cueOpacity =
      (atom.glint || isHi ? 0.1 + atom.cloud * 0.12 : 0.1 + atom.cloud * 0.18) *
      (0.55 + p.depth * 0.5);
    const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, cueRadius);
    if (atom.glint || isHi) {
      g.addColorStop(0, `rgba(232, 184, 74, ${cueOpacity})`);
      g.addColorStop(1, "rgba(232, 184, 74, 0)");
    } else {
      g.addColorStop(0, `rgba(126, 140, 242, ${cueOpacity})`);
      g.addColorStop(1, "rgba(126, 140, 242, 0)");
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, cueRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // traverse backbone
  for (let i = 0; i < path.length - 1; i++) {
    const a = projected[path[i]];
    const b = projected[path[i + 1]];
    const lit = hi >= i;
    ctx.strokeStyle = lit
      ? `rgba(240, 196, 90, ${0.5 + a.depth * 0.25})`
      : `rgba(118, 217, 203, ${0.14 + a.depth * 0.2})`;
    ctx.lineWidth = lit ? 1.8 : 0.85 + a.depth;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  const order = atoms.map((_, i) => i).sort((a, b) => projected[a].z - projected[b].z);
  for (const i of order) {
    const atom = atoms[i];
    const p = projected[i];
    const isHi = atom.id === hiId;
    const pulse = atom.glint || isHi ? 0.55 + 0.45 * Math.sin(t * 0.045 + i) : 0;
    drawSoftNode(p, atom, isHi, pulse);
  }

  // no on-canvas labels — HTML rail only
  if (hiAtom) {
    highlightCard(hiAtom.role);
    const meta = leafMeta[hiAtom.role];
    if (hudHighlight) {
      hudHighlight.textContent = meta
        ? `${ROLE_COPY[hiAtom.role]} · ${meta.name}`
        : ROLE_COPY[hiAtom.role] || hiAtom.role;
    }
    if (hudStatus) {
      hudStatus.textContent = playing
        ? `Traverse ${hi + 1} / ${path.length}`
        : "Paused — press Play traverse";
    }
  }
}

function tick() {
  draw();
  if (playing) t += 1;
  raf = requestAnimationFrame(tick);
}

async function loadBundle() {
  if (hudStatus) hudStatus.textContent = "Loading voice leaves…";
  const [twoRes, cloneRes] = await Promise.all([
    fetch("/api/demo/two-avatar-call/latest"),
    fetch("/api/demo/voice-clone/latest"),
  ]);
  let two = twoRes.ok ? await twoRes.json() : null;
  let clone = cloneRes.ok ? await cloneRes.json() : null;

  if (!two && !clone) {
    const seeded = await fetch("/api/demo/two-avatar-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (seeded.ok) two = await seeded.json();
    const c = await fetch("/api/demo/voice-clone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (c.ok) clone = await c.json();
  }

  buildAtoms({
    turns: two?.turns || [],
    interaction_mmr_root: two?.interaction_mmr_root,
    mmr_root: clone?.mmr_root,
    clone,
  });
  if (hudStatus) hudStatus.textContent = path.length ? "Ready — press Play traverse" : "No voice leaves yet";
  t = 0;
}

playBtn?.addEventListener("click", () => {
  playing = !playing;
  playBtn.textContent = playing ? "Pause traverse" : "Play traverse";
});
refreshBtn?.addEventListener("click", () => loadBundle());
window.addEventListener("resize", () => fitCanvas());

loadBundle().then(() => {
  if (!raf) tick();
});
