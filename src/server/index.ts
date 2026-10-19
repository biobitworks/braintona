import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyReceipt } from "../lib/receipts.js";
import { narrateElevenLabs } from "./elevenlabs.js";
import { loadLatestGraph, refreshCustodyGraph } from "./graph.js";
import { loadLatestReceipt, loadLatestTokenTrace, runPipeline } from "./pipeline.js";
import { buildContrastDemo } from "./voice_origin.js";
import {
  loadLatestPrivateConversationPointer,
  sealCursorConversationPrivate,
} from "./conversation_custody.js";
import { mountWorkosRoutes, workosEnabled } from "./workos.js";
import { mountCopilotKitRoutes, copilotkitLicensePresent } from "./copilotkit.js";
import { mountCodeRabbitRoutes, coderabbitKeyPresent } from "./coderabbit.js";
import { runTwoAvatarCallDemo } from "./two_avatar_call.js";
import { runVoiceCloneDemo } from "./voice_clone.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");
const app = express();
const PORT = Number(process.env.PORT || 8787);

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://127.0.0.1:8787,http://localhost:8787")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(publicDir));

// AuthKit routes (/login /callback /logout /api/auth/status) — optional, non-gating
mountWorkosRoutes(app);
// CopilotKit FCO cockpit routes — license via CLI org login
mountCopilotKitRoutes(app);
mountCodeRabbitRoutes(app);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "braintona",
    deadline: "2026-07-24T15:30:00-07:00",
    sponsors: ["daytona", "braintrust", "fireworks", "elevenlabs", "copilotkit", "coderabbit", "workos"],
    keys: {
      daytona: Boolean(process.env.DAYTONA_API_KEY),
      fireworks: Boolean(process.env.FIREWORKS_API_KEY),
      braintrust: Boolean(process.env.BRAINTRUST_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY || process.env.ELEVEN_API_KEY),
      workos: workosEnabled(),
      copilotkit: copilotkitLicensePresent(),
      coderabbit: coderabbitKeyPresent(),
    },
    claim_ceiling: "custody = provenance, not correctness",
    workos: {
      enabled: workosEnabled(),
      redirect_uri: process.env.WORKOS_REDIRECT_URI || "http://127.0.0.1:8787/callback",
      mode: "local_first_optional_auth",
    },
    copilotkit: {
      license_present: copilotkitLicensePresent(),
      status_path: "/api/copilotkit/status",
      dashboard: "https://dashboard.operations.copilotkit.ai",
    },
    coderabbit: {
      featured: true,
      api_key_present: coderabbitKeyPresent(),
      status_path: "/api/coderabbit/status",
      path_b: "docs/CODERABBIT_DISCORD_PATH_B.md",
      touches: "docs/SPONSOR_TOUCHES.md",
    },
  });
});

app.post("/api/run", async (req, res) => {
  try {
    const source = typeof req.body?.source === "string" ? req.body.source : undefined;
    const skipDaytona = Boolean(req.body?.skipDaytona);
    const result = await runPipeline({ source, skipDaytona, plantTamper: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/latest", async (_req, res) => {
  const receipt = await loadLatestReceipt();
  if (!receipt) return res.status(404).json({ error: "no receipt yet" });
  const verify = await verifyReceipt(receipt);
  res.json({ receipt, verify });
});

/** Session-local custody knowledge graph (grows with each pipeline run). */
app.get("/api/graph", async (_req, res) => {
  try {
    const graph = (await loadLatestGraph()) ?? (await refreshCustodyGraph());
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/trace/latest", async (_req, res) => {
  const trace = await loadLatestTokenTrace();
  if (!trace) return res.status(404).json({ error: "no token trace yet — run pipeline" });
  res.json(trace);
});

app.post("/api/graph/refresh", async (_req, res) => {
  try {
    const graph = await refreshCustodyGraph();
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});


/** Seal Cursor conversation as private custody object (hashes only in public graph). */
app.post("/api/conversation/seal-private", async (req, res) => {
  try {
    const result = await sealCursorConversationPrivate({
      transcript_path: typeof req.body?.transcript_path === "string" ? req.body.transcript_path : undefined,
      continuous_session_id:
        typeof req.body?.continuous_session_id === "string" ? req.body.continuous_session_id : undefined,
      cloud_agent_bc_id:
        typeof req.body?.cloud_agent_bc_id === "string" ? req.body.cloud_agent_bc_id : undefined,
      note: typeof req.body?.note === "string" ? req.body.note : undefined,
    });
    const { pointer, vault_path, graph_attached } = result;
    res.json({
      ok: true,
      pointer,
      vault_path,
      graph_attached,
      plaintext_included: false,
      note: "Public response is hash-only; vault sidecar is gitignored",
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/conversation/private-pointer", async (_req, res) => {
  const pointer = await loadLatestPrivateConversationPointer();
  if (!pointer) return res.status(404).json({ error: "no private conversation sealed yet" });
  // Public surface: hashes only — never leak local filesystem paths
  const { transcript_path_local: _path, ...publicPointer } = pointer as typeof pointer & {
    transcript_path_local?: string;
  };
  res.json({
    ...publicPointer,
    transcript_path_sha256: pointer.transcript_sha256 ? undefined : undefined,
    path_redacted: true,
  });
});

app.post("/api/verify", async (req, res) => {
  try {
    const receipt = req.body?.receipt;
    if (!receipt) return res.status(400).json({ error: "receipt required" });
    const verify = await verifyReceipt(receipt);
    res.json(verify);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/api/narrate", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  if (!text) return res.status(400).json({ error: "text required" });
  const audio = await narrateElevenLabs(text);
  res.json(audio);
});

/** Human vs AI voice-origin FCO/MMR contrast (preprint method). */

/** Two ElevenLabs avatars: customer (Sarah) vs agent (Matilda) → dual FCO trees + vault root. */
app.post("/api/demo/two-avatar-call", async (req, res) => {
  try {
    const demo = await runTwoAvatarCallDemo({
      customer_text: typeof req.body?.customer_text === "string" ? req.body.customer_text : undefined,
      agent_text: typeof req.body?.agent_text === "string" ? req.body.agent_text : undefined,
      customer_voice_id:
        typeof req.body?.customer_voice_id === "string" ? req.body.customer_voice_id : undefined,
      agent_voice_id: typeof req.body?.agent_voice_id === "string" ? req.body.agent_voice_id : undefined,
      customer_name: typeof req.body?.customer_name === "string" ? req.body.customer_name : undefined,
      agent_name: typeof req.body?.agent_name === "string" ? req.body.agent_name : undefined,
    });
    res.json(demo);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/demo/two-avatar-call/latest", async (_req, res) => {
  try {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const raw = await readFile(path.resolve("data/two_avatar_call_latest.json"), "utf8");
    res.type("json").send(raw);
  } catch {
    res.status(404).json({ error: "no two-avatar demo yet" });
  }
});

/** Register ElevenLabs voice clone as FCO + seal one AI utterance under it. */
app.post("/api/demo/voice-clone", async (req, res) => {
  try {
    const demo = await runVoiceCloneDemo({
      voice_id: typeof req.body?.voice_id === "string" ? req.body.voice_id : undefined,
      text: typeof req.body?.text === "string" ? req.body.text : undefined,
      display_name: typeof req.body?.display_name === "string" ? req.body.display_name : undefined,
    });
    res.json(demo);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/api/demo/voice-clone/latest", async (_req, res) => {
  try {
    const { readFile } = await import("node:fs/promises");
    const pathMod = await import("node:path");
    const raw = await readFile(pathMod.resolve("data/voice_clone_latest.json"), "utf8");
    res.type("json").send(raw);
  } catch {
    res.status(404).json({ error: "no voice-clone demo yet" });
  }
});

app.post("/api/voice-origin", async (req, res) => {
  try {
    const text =
      typeof req.body?.text === "string" && req.body.text.trim()
        ? req.body.text.trim()
        : "Braintona custody verified. This leaf is AI-origin speech.";
    const result = await buildContrastDemo(text);
    const { audio_base64, ...rest } = result;
    res.json({
      ...rest,
      audio_included: Boolean(audio_base64),
      audio_base64: req.body?.includeAudio ? audio_base64 : undefined,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`braintona listening on http://127.0.0.1:${PORT}`);
  console.log(`workos ${workosEnabled() ? "enabled (optional AuthKit)" : "disabled"}`);
});
