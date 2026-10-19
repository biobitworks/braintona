import type { Express } from "express";
import { loadLatestInteraction, sealInteractionTurn, type TurnActor } from "../lib/interaction_turns.js";

const ACTORS = new Set<TurnActor>(["human", "ai", "tool", "operator"]);

export function copilotkitLicensePresent(): boolean {
  return Boolean(process.env.COPILOTKIT_LICENSE_TOKEN?.trim());
}

export function mountCopilotKitRoutes(app: Express): void {
  app.get("/api/copilotkit/status", (_req, res) => {
    const license = copilotkitLicensePresent();
    res.json({
      ok: true,
      sponsor: "CopilotKit",
      organization: "operator-linked (CLI login selects org)",
      license_present: license,
      dashboard: "https://dashboard.operations.copilotkit.ai",
      next: license
        ? "Seal operator/AI turns via POST /api/copilotkit/seal-turn"
        : [
            "npx copilotkit@latest login  # pick your organization",
            "npx copilotkit@latest project select",
            "npx copilotkit@latest license create --write",
          ],
      fco_fit: "Each chat turn → FCO leaf; thread tip = interaction MMR",
      claim_ceiling: "provenance of recorded turns, not correctness",
    });
  });

  app.get("/api/copilotkit/interaction/latest", async (_req, res) => {
    const thread = await loadLatestInteraction();
    if (!thread) return res.status(404).json({ error: "no CopilotKit interaction sealed yet" });
    res.json(thread);
  });

  app.post("/api/copilotkit/seal-turn", async (req, res) => {
    try {
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      const actorRaw = typeof req.body?.actor === "string" ? req.body.actor : "operator";
      const actor = (ACTORS.has(actorRaw as TurnActor) ? actorRaw : "operator") as TurnActor;
      const interaction_id =
        typeof req.body?.interaction_id === "string" ? req.body.interaction_id : undefined;
      const thread = await sealInteractionTurn({
        text,
        actor,
        license_present: copilotkitLicensePresent(),
        interaction_id,
      });
      res.json({
        ok: true,
        thread,
        plaintext_included: false,
        note: "Public thread stores text_sha256 + leaf hashes only",
      });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });
}
