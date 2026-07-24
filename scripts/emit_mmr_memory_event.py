#!/usr/bin/env python3
"""Emit an FCO/FCG-hashed MMR memory event (continuous-session variant).

New chats, process spin-ups, AI access, context clears, and host/runtime hops
are FCO-typed when touched/integrated. scoring_mode may be labeled_only,
msm_admit, scored, or mix (Anticube + MSM_ADMIT + optional H_*).

Leaf: sha256(0x00 || canonical_json). MMR tip: sha256(0x00 || parent|leaf).

Does not PI-sign. llm_in_science_leaf always false.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MMR_DIR = ROOT / ".planning" / "mmr"
EVENTS = MMR_DIR / "memory_events.jsonl"
TIP_FILE = MMR_DIR / "TIP.json"
SCHEMA = "fco.mmr.memory_event.v1"

SUBTYPES = (
    "context_clear",
    "agent_swap",
    "model_swap",
    "runtime_hop",
    "host_hop",
    "new_chat",
    "process_spinup",
    "ai_access",
    "integration_touch",
)
ANTICUBE = ("SS", "SN", "NS", "NN")
MSM = ("SAFE", "NON_SAFE")
SCORING = ("labeled_only", "msm_admit", "scored", "mix")


def _canon(obj: dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )


def _leaf(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(b"\x00" + data).hexdigest()


def _git(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def load_tip() -> str | None:
    if not TIP_FILE.is_file():
        return None
    try:
        return json.loads(TIP_FILE.read_text()).get("mmr_tip")
    except json.JSONDecodeError:
        return None


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--subtype", required=True, choices=SUBTYPES)
    p.add_argument("--continuous-session-id", required=True)
    p.add_argument("--runtime", required=True)
    p.add_argument("--model", default="")
    p.add_argument("--execution-role", default="SWE")
    p.add_argument("--binding", action="append", default=[])
    p.add_argument("--note", default="")
    p.add_argument("--parent-tip", default="")
    p.add_argument("--scoring-mode", default="mix", choices=SCORING)
    p.add_argument("--anticube", default="SS", choices=ANTICUBE)
    p.add_argument("--msm-admit", default="SAFE", choices=MSM)
    p.add_argument("--h-info", type=float, default=None)
    p.add_argument("--h-stick", type=float, default=None)
    p.add_argument("--h-bind", type=float, default=None)
    p.add_argument(
        "--graph-update",
        default="appended",
        choices=("appended", "deferred", "queued"),
    )
    args = p.parse_args()

    MMR_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    parent = args.parent_tip or load_tip() or ("sha256:" + ("0" * 64))

    body = {
        "schema": SCHEMA,
        "kind": "memory_event",
        "event_subtype": args.subtype,
        "session_continuity": "continuous_variant",
        "continuous_session_id": args.continuous_session_id,
        "parent_mmr_tip": parent,
        "ts_utc": ts,
        "host_id": os.getenv("WATCHTOWER_HOST_ID", "cursor-cloud"),
        "git_branch": _git(["git", "branch", "--show-current"]),
        "git_head": _git(["git", "rev-parse", "HEAD"]),
        "established_bindings": args.binding,
        "note": args.note,
        "scoring_mode": args.scoring_mode,
        "anticube": {"label": args.anticube, "poison_ne_sn": True},
        "msm_admit": {"gate": args.msm_admit, "channel": "MSM_ADMIT"},
        "scores": {
            "H_info": args.h_info,
            "H_stick": args.h_stick,
            "H_bind": args.h_bind,
        },
        "graph_update": {
            "mmr": args.graph_update,
            "seedgraph_pointer": "queued" if args.msm_admit == "SAFE" else "deferred",
            "watchtower_receipt": "written",
        },
        "authority": {
            "claim_promotion": False,
            "writeback_authorized": False,
            "push_authorized": False,
            "commit_authorized": False,
        },
        "role_header": {
            "execution_role": args.execution_role,
            "approval_role": "none",
            "runtime": args.runtime,
            "model_or_agent": args.model or args.runtime,
        },
        "llm_in_science_leaf": False,
        "writeback": False,
        "pi_signed": False,
    }

    leaf = _leaf(_canon(body))
    tip = _leaf(f"{parent}|{leaf}".encode("utf-8"))
    sig_hash = _leaf(_canon({"leaf": leaf, "tip": tip, "signer": args.runtime, "ts": ts}))
    leaf_hex = leaf.removeprefix("sha256:")
    sig_id = f"SIG-{ts}-{args.runtime.replace(' ', '-')}-{leaf_hex[:8]}"

    event = {
        **body,
        "fco_style_leaf": leaf,
        "mmr_tip": tip,
        "signature": {
            "signature_id": sig_id,
            "signature_hash": sig_hash,
            "signer": args.runtime,
            "note": "local custody signature (not PI ed25519); advisory chain link only",
        },
    }

    with EVENTS.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, sort_keys=True) + "\n")

    TIP_FILE.write_text(
        json.dumps(
            {
                "schema": "fco.mmr.tip.v1",
                "mmr_tip": tip,
                "parent_mmr_tip": parent,
                "last_event_leaf": leaf,
                "signature_id": sig_id,
                "continuous_session_id": args.continuous_session_id,
                "scoring_mode": args.scoring_mode,
                "anticube": args.anticube,
                "msm_admit": args.msm_admit,
                "ts_utc": ts,
                "llm_in_science_leaf": False,
            },
            indent=2,
        )
        + "\n"
    )

    out = MMR_DIR / f"event_{ts}_{args.subtype}.json"
    out.write_text(json.dumps(event, indent=2) + "\n")
    print(
        json.dumps(
            {
                "ok": True,
                "path": str(out.relative_to(ROOT)),
                "mmr_tip": tip,
                "signature_id": sig_id,
                "fco_style_leaf": leaf,
                "anticube": args.anticube,
                "msm_admit": args.msm_admit,
                "scoring_mode": args.scoring_mode,
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
