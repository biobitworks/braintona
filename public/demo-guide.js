/**
 * Demo walkthrough — Prev / Next across presentation pages (Studio record).
 * Next only changes pages. Actions like "Run live pipeline" happen ON that page.
 */
(function () {
  const STEPS = [
    {
      id: "pitch",
      path: "/pitch.html",
      title: "1 · Pitch",
      cue: "Talk only — then press Next page",
      action: "No click required on this page",
    },
    {
      id: "pipeline",
      path: "/",
      title: "2 · Pipeline",
      cue: "ON THIS PAGE: click Run live pipeline",
      action: "Wait for Daytona OK and tamper reject, then Next page",
    },
    {
      id: "star",
      path: "/demo-voice-star.html",
      title: "3 · Voice star chart",
      cue: "ON THIS PAGE: click Play traverse",
      action: "Watch the gold customer sphere, then Next page",
    },
    {
      id: "two-turn",
      path: "/demo-two-turn.html",
      title: "4 · Two-turn audio",
      cue: "ON THIS PAGE: click Run two-turn demo",
      action: "Play both audio leaves, then Next page",
    },
    {
      id: "end",
      path: "/demo-guide.html?done=1",
      title: "5 · Close",
      cue: "Say: github.com/biobitworks/braintona",
      action: "Stop Studio screen record and Pro QuickTime",
    },
  ];

  function currentIndex() {
    const p = location.pathname.replace(/\/$/, "") || "/";
    const q = new URLSearchParams(location.search);
    if (p.endsWith("/demo-guide.html") && q.get("done") === "1") {
      return STEPS.findIndex((s) => s.id === "end");
    }
    if (p.endsWith("/demo-guide.html")) return -1;
    if (p === "" || p === "/") return STEPS.findIndex((s) => s.id === "pipeline");
    return STEPS.findIndex((s) => p.endsWith(s.path) || p === s.path);
  }

  const params = new URLSearchParams(location.search);
  // Clean gallery / Devpost stills — no floating guide chrome
  if (params.get("shot") === "1" || params.get("noguide") === "1") return;

  const idx = currentIndex();
  if (idx < 0) return;

  const prev = STEPS[idx - 1];
  const next = STEPS[idx + 1];
  const step = STEPS[idx];

  const bar = document.createElement("nav");
  bar.id = "demoGuideBar";
  bar.setAttribute("aria-label", "Demo walkthrough");
  bar.innerHTML =
    '<div class="dg-meta">' +
    '<span class="dg-step">Step ' +
    (idx + 1) +
    " of " +
    STEPS.length +
    "</span>" +
    '<strong class="dg-title">' +
    step.title +
    "</strong>" +
    '<span class="dg-cue">' +
    step.cue +
    "</span>" +
    '<span class="dg-action">' +
    step.action +
    "</span>" +
    "</div>" +
    '<div class="dg-actions">' +
    '<a class="dg-btn ghost" href="' +
    (prev ? prev.path : "#") +
    '" ' +
    (prev ? "" : 'aria-disabled="true"') +
    ">Prev</a>" +
    '<a class="dg-btn" href="' +
    (next ? next.path : "#") +
    '" ' +
    (next ? "" : 'aria-disabled="true"') +
    ">" +
    (next ? (next.id === "end" ? "Finish" : "Next page") : "Done") +
    "</a>" +
    "</div>";

  const style = document.createElement("style");
  style.textContent = [
    "#demoGuideBar{",
    "position:fixed;left:50%;bottom:0.5rem;transform:translateX(-50%);z-index:9999;",
    "display:flex;flex-wrap:wrap;gap:0.5rem 0.85rem;",
    "align-items:center;justify-content:space-between;",
    "width:min(1100px,calc(100vw - 1.5rem));",
    "padding:0.55rem 0.8rem;",
    "background:color-mix(in srgb,#1a0f1f 94%,transparent);",
    "border:1px solid color-mix(in srgb,#c9b87a 40%,#2a1b35);",
    "backdrop-filter:blur(16px);box-shadow:0 12px 28px rgba(0,0,0,.5);",
    'font-family:"JetBrains Mono",ui-monospace,monospace;color:#f5f0e4;',
    "}",
    "#demoGuideBar .dg-meta{display:grid;gap:0.1rem;min-width:min(100%,28rem);flex:1;}",
    "#demoGuideBar .dg-step{font-size:0.65rem;letter-spacing:.14em;text-transform:uppercase;color:#c9b87a;}",
    "#demoGuideBar .dg-title{font-family:Fraunces,Georgia,serif;font-size:1rem;line-height:1.15;}",
    "#demoGuideBar .dg-cue{font-size:0.82rem;color:#f5f0e4;font-weight:600;}",
    "#demoGuideBar .dg-action{font-size:0.72rem;color:#a89983;}",
    "#demoGuideBar .dg-actions{display:flex;gap:0.45rem;flex-shrink:0;}",
    "#demoGuideBar .dg-btn{display:inline-flex;align-items:center;padding:0.55rem 0.9rem;",
    "background:#c9b87a;color:#0f0716;text-decoration:none;font-weight:700;font-size:0.85rem;}",
    "#demoGuideBar .dg-btn.ghost{background:transparent;color:#f5f0e4;outline:1px solid color-mix(in srgb,#f5f0e4 22%,transparent);}",
    '#demoGuideBar .dg-btn[aria-disabled="true"]{opacity:0.35;pointer-events:none;}',
    "body{padding-bottom:5.5rem;}",
  ].join("");

  document.head.appendChild(style);
  document.body.appendChild(bar);
})();
