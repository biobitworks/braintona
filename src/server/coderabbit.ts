import type { Express } from "express";
import { loadLatestCodeRabbitObserve, sealCodeRabbitObserve } from "../lib/coderabbit_observe.js";

export function coderabbitKeyPresent(): boolean {
  return Boolean(process.env.CODERABBIT_API_KEY?.trim());
}

export function mountCodeRabbitRoutes(app: Express): void {
  app.get("/api/coderabbit/status", async (_req, res) => {
    const latest = await loadLatestCodeRabbitObserve();
    res.json({
      ok: true,
      sponsor: "CodeRabbit",
      featured: true,
      api_key_present: coderabbitKeyPresent(),
      repo: "https://github.com/biobitworks/braintona",
      path_b: "docs/CODERABBIT_DISCORD_PATH_B.md",
      touches: "docs/SPONSOR_TOUCHES.md",
      latest_observe: latest,
      next: latest
        ? "Observe hop sealed — show on token trace / sponsor strip"
        : [
            "gh pr ready 3 && gh pr comment 3 --body '@coderabbitai review'",
            "POST /api/coderabbit/seal-observe with pr_number",
            "Discord Path B when ready",
          ],
      claim_ceiling: "observer_not_pi_seal_not_science_truth",
    });
  });

  app.get("/api/coderabbit/observe/latest", async (_req, res) => {
    const latest = await loadLatestCodeRabbitObserve();
    if (!latest) return res.status(404).json({ error: "no CodeRabbit observe sealed yet" });
    res.json(latest);
  });

  app.post("/api/coderabbit/seal-observe", async (req, res) => {
    try {
      const receipt = await sealCodeRabbitObserve({
        surface:
          req.body?.surface === "discord_path_b" || req.body?.surface === "manual"
            ? req.body.surface
            : "github_pr_bot",
        pr_url: typeof req.body?.pr_url === "string" ? req.body.pr_url : undefined,
        pr_number: typeof req.body?.pr_number === "number" ? req.body.pr_number : undefined,
        event: typeof req.body?.event === "string" ? req.body.event : "review_request_or_bot_touch",
        note: typeof req.body?.note === "string" ? req.body.note : undefined,
        bot_login: typeof req.body?.bot_login === "string" ? req.body.bot_login : undefined,
      });
      res.json({
        ok: true,
        featured: true,
        receipt,
        note: "CodeRabbit observe hop sealed — does not rewrite content leaf",
      });
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });
}
