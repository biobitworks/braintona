#!/usr/bin/env python3
"""Emit an FCO custody leaf for any interaction turn or external I/O.

OPERATOR lock 2026-07-24: FCO/FCG across all projects — each interaction
hashed so human vs AI vs other can be distinguished. Covers primary agents,
subagents, Ollarma, external inference, GPU/TPU, API, MCP, and DB I/O.

Leaf: sha256(0x00 || canonical_json_of_preimage).
Bodies are hashed only — never enter science leaf preimage
(llm_in_science_leaf: false). Does not PI-sign.

Storage: local hot path (.planning/conversation_turns/). SeedGraph batch
ingest is deferred/operator-gated (see INTERACTION_CUSTODY_STORAGE_PLACEMENT).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TURN_DIR = ROOT / ".planning" / "conversation_turns"
LEDGER = TURN_DIR / "turns.jsonl"
DEFERRED = ROOT / ".planning" / "deferred_writeback_candidates.jsonl"
SCHEMA = "portfolio.conversation_turn_fco.v1"

CONTENT_CLASSES = ("human", "ai", "other")
ACTOR_KINDS = (
    "human",
    "primary_agent",
    "subagent",
    "ollarma",
    "ollama",
    "external_inference",
    "gpu_job",
    "tpu_job",
    "api_call",
    "mcp_call",
    "db_call",
    "tool",
    "system",
    "other",
)
IO_SIDES = ("request", "response", "both", "none")
AI_ACTORS = {
    "primary_agent",
    "subagent",
    "ollarma",
    "ollama",
    "external_inference",
    "gpu_job",
    "tpu_job",
}


def _canon(obj: dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )


def _leaf(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(b"\x00" + data).hexdigest()


def _sha256_bytes(b: bytes) -> str:
    return "sha256:" + hashlib.sha256(b).hexdigest()


def _sha256_text(text: str) -> str:
    return _sha256_bytes(text.encode("utf-8"))


def _git(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def _content_class_for_actor(actor_kind: str, explicit: str | None) -> str:
    if explicit:
        return explicit
    if actor_kind == "human":
        return "human"
    if actor_kind in AI_ACTORS:
        return "ai"
    return "other"


def _hash_payload(text: str, path: str) -> tuple[str | None, int]:
    if path:
        b = Path(path).read_bytes()
        return _sha256_bytes(b), len(b)
    if text:
        b = text.encode("utf-8")
        return _sha256_bytes(b), len(b)
    return None, 0


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--continuous-session-id", required=True)
    p.add_argument("--actor-kind", required=True, choices=ACTOR_KINDS)
    p.add_argument("--content-class", choices=CONTENT_CLASSES, default=None)
    p.add_argument("--runtime", default="cursor")
    p.add_argument("--model", default="")
    p.add_argument("--subagent-id", default="")
    p.add_argument("--subagent-type", default="")
    p.add_argument("--parent-turn-leaf", default="")
    p.add_argument("--parent-mmr-tip", default="")
    p.add_argument("--text", default="")
    p.add_argument("--text-file", default="")
    p.add_argument("--request-text", default="")
    p.add_argument("--request-file", default="")
    p.add_argument("--response-text", default="")
    p.add_argument("--response-file", default="")
    p.add_argument("--io-side", default="none", choices=IO_SIDES)
    p.add_argument("--endpoint", default="")
    p.add_argument("--provider", default="")
    p.add_argument("--machine-shape", default="")
    p.add_argument("--job-id", default="")
    p.add_argument("--mcp-server", default="")
    p.add_argument("--mcp-tool", default="")
    p.add_argument("--db-system", default="")
    p.add_argument("--note", default="")
    p.add_argument("--via", default="")
    p.add_argument("--signer", default="")
    p.add_argument(
        "--queue-seedgraph",
        action="store_true",
        help="Append a deferred SeedGraph writeback-candidate row (no live write)",
    )
    args = p.parse_args()

    text = args.text
    if args.text_file:
        text = Path(args.text_file).read_text(encoding="utf-8")

    req_sha, req_len = _hash_payload(args.request_text, args.request_file)
    resp_sha, resp_len = _hash_payload(args.response_text, args.response_file)

    content_class = _content_class_for_actor(args.actor_kind, args.content_class)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    text_sha = _sha256_text(text) if text else None
    signer = args.signer or (
        "human"
        if args.actor_kind == "human"
        else "subagent"
        if args.actor_kind == "subagent"
        else "model"
        if args.actor_kind in AI_ACTORS
        else "system"
    )

    io_side = args.io_side
    if io_side == "none" and (req_sha or resp_sha):
        if req_sha and resp_sha:
            io_side = "both"
        elif req_sha:
            io_side = "request"
        else:
            io_side = "response"

    preimage = {
        "schema": SCHEMA,
        "continuous_session_id": args.continuous_session_id,
        "ts": ts,
        "content_class": content_class,
        "actor_kind": args.actor_kind,
        "signer": signer,
        "runtime": args.runtime,
        "model": args.model or None,
        "subagent_id": args.subagent_id or None,
        "subagent_type": args.subagent_type or None,
        "io_side": io_side,
        "endpoint": args.endpoint or None,
        "provider": args.provider or None,
        "machine_shape": args.machine_shape or None,
        "job_id": args.job_id or None,
        "mcp_server": args.mcp_server or None,
        "mcp_tool": args.mcp_tool or None,
        "db_system": args.db_system or None,
        "text_sha256": text_sha,
        "text_bytes": len(text.encode("utf-8")) if text else 0,
        "request_sha256": req_sha,
        "request_bytes": req_len,
        "response_sha256": resp_sha,
        "response_bytes": resp_len,
        "via": args.via or None,
        "note": args.note or None,
        "parent_turn_leaf": args.parent_turn_leaf or None,
        "parent_mmr_tip": args.parent_mmr_tip or None,
        "git_head": _git(["git", "rev-parse", "HEAD"]) or None,
        "host": os.uname().nodename if hasattr(os, "uname") else None,
        "llm_in_science_leaf": False,
    }
    leaf = _leaf(_canon(preimage))

    record = {
        **preimage,
        "fco_style_leaf": leaf,
        "signed": False,
        "authority": {
            "claim_promotion": False,
            "pi_sign": False,
            "writeback": False,
        },
    }

    TURN_DIR.mkdir(parents=True, exist_ok=True)
    with LEDGER.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, sort_keys=True) + "\n")

    side = TURN_DIR / f"turn_{ts.replace(':', '')}_{leaf[-12:]}.json"
    side.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    receipts = ROOT / ".planning" / "receipts.jsonl"
    with receipts.open("a", encoding="utf-8") as f:
        f.write(
            json.dumps(
                {
                    "schema": "portfolio.interaction_receipt.v1",
                    "ts": ts,
                    "slug": f"interaction-{content_class}-{args.actor_kind}",
                    "fco_style_leaf": leaf,
                    "continuous_session_id": args.continuous_session_id,
                    "content_class": content_class,
                    "actor_kind": args.actor_kind,
                    "signer": signer,
                    "subagent_id": args.subagent_id or None,
                    "mcp_server": args.mcp_server or None,
                    "mcp_tool": args.mcp_tool or None,
                    "db_system": args.db_system or None,
                    "provider": args.provider or None,
                    "job_id": args.job_id or None,
                    "via": args.via or None,
                    "llm_in_science_leaf": False,
                },
                sort_keys=True,
            )
            + "\n"
        )

    if args.queue_seedgraph:
        with DEFERRED.open("a", encoding="utf-8") as f:
            f.write(
                json.dumps(
                    {
                        "schema": "portfolio.deferred_writeback_candidate.v1",
                        "ts": ts,
                        "target": "seedgraph",
                        "kind": "interaction_turn_fco",
                        "status": "candidate",
                        "fco_style_leaf": leaf,
                        "sidecar": str(side),
                        "live_writeback_performed": False,
                        "llm_in_science_leaf": False,
                    },
                    sort_keys=True,
                )
                + "\n"
            )

    print(
        json.dumps(
            {
                "ok": True,
                "fco_style_leaf": leaf,
                "content_class": content_class,
                "actor_kind": args.actor_kind,
                "signer": signer,
                "ledger": str(LEDGER),
                "sidecar": str(side),
                "seedgraph_queued": bool(args.queue_seedgraph),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
