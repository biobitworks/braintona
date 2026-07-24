#!/usr/bin/env python3
"""Hash material artifacts into unsigned FCG bag (no PI-seal)."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BAG = ROOT / ".planning/quick/260724-braintona-hacksprint/FCG_BAG.json"
RECEIPTS = ROOT / ".planning/receipts.jsonl"

INCLUDE = [
    "IDEA.md",
    "README.md",
    "LICENSE",
    "LICENSE.md",
    "LICENSE-CC-BY-ND-4.0",
    "package.json",
    "src/lib/fco.ts",
    "src/lib/receipts.ts",
    "src/lib/custody_graph.ts",
    "src/lib/token_trace.ts",
    "src/lib/private_conversation.ts",
    "src/server/conversation_custody.ts",
    "docs/PRIVATE_CONVERSATION_CUSTODY.md",
    "docs/DEVPOST_DESCRIPTION.md",
    "docs/DEVPOST_SUBMISSION.md",
    "docs/PITCH_PACK.md",
    "docs/SPONSOR_TOUCHES.md",
    "scripts/seal_private_conversation.ts",
    "scripts/emit_conversation_turn_fco.py",
    "scripts/emit_mmr_memory_event.py",
    "src/server/pipeline.ts",
    "src/server/daytona.ts",
    "src/server/fireworks.ts",
    "src/server/eval.ts",
    "src/server/index.ts",
    "public/index.html",
    "public/app.js",
    "public/styles.css",
    "public/pitch.html",
    "public/demo-voice-star.html",
    "demo-video/CUSTODY.json",
    "demo-video/README.md",
    "docs/link_capture.jsonl",
    ".planning/PROJECT.md",
    ".planning/REQUIREMENTS.md",
    ".planning/ROADMAP.md",
    ".planning/STATE.md",
    ".planning/lexicon/TERMS.jsonl",
    ".planning/quick/260724-braintona-hacksprint/DUAL_LICENSE_FCG.json",
    ".planning/quick/260724-braintona-hacksprint/SUBMISSION_CLOSEOUT.json",
]


def fco_style_hash(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(b"\x00" + data).hexdigest()


def main() -> None:
    artifacts = []
    for rel in INCLUDE:
        p = ROOT / rel
        if not p.exists():
            continue
        data = p.read_bytes()
        artifacts.append(
            {
                "path": rel,
                "bytes": len(data),
                "sha256_fco_style": fco_style_hash(data),
            }
        )
    bag = {
        "schema": "portfolio.fcg_bag.v1",
        "project": "braintona",
        "title": "Daytona HackSprint SF Jul 2026 — Braintona",
        "updated_at_utc": datetime.now(timezone.utc).isoformat(),
        "signed": False,
        "pi_seal": False,
        "llm_in_science_leaf": False,
        "goal": "Ship Braintona (Daytona×Braintrust×FCO) and submit Devpost by 15:30 PDT",
        "artifacts": artifacts,
        "n_artifacts": len(artifacts),
    }
    BAG.parent.mkdir(parents=True, exist_ok=True)
    BAG.write_text(json.dumps(bag, indent=2) + "\n")
    receipt = {
        "ts": bag["updated_at_utc"],
        "event": "fcg_bag_update",
        "n_artifacts": len(artifacts),
        "bag": str(BAG.relative_to(ROOT)),
        "llm_in_science_leaf": False,
    }
    with RECEIPTS.open("a") as f:
        f.write(json.dumps(receipt) + "\n")
    print(json.dumps({"ok": True, "n_artifacts": len(artifacts), "bag": str(BAG)}, indent=2))


if __name__ == "__main__":
    main()
