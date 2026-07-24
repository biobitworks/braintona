import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyReceipt } from "../lib/receipts.js";
import { narrateElevenLabs } from "./elevenlabs.js";
import { loadLatestReceipt, runPipeline } from "./pipeline.js";
import { buildContrastDemo } from "./voice_origin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../../public");
const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(publicDir));

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
    },
    claim_ceiling: "custody = provenance, not correctness",
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
app.post("/api/voice-origin", async (req, res) => {
  try {
    const text =
      typeof req.body?.text === "string" && req.body.text.trim()
        ? req.body.text.trim()
        : "Braintona custody verified. This leaf is AI-origin speech.";
    const result = await buildContrastDemo(text);
    // Don't dump huge audio into JSON unless requested
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
});
