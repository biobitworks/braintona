#!/usr/bin/env python3
"""Seal demo-script seeds-of-truth into FCG, then compile teleprompter.

Order (locked): atomize seeds → hash leaves → bag tip → compile spoken script.
The teleprompter must only concatenate seed `say` fields; no orphan spoken lines.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEED_DIR = ROOT / ".planning/quick/260724-braintona-hacksprint/demo_script_seeds"
BAG_PATH = ROOT / ".planning/quick/260724-braintona-hacksprint/DEMO_SCRIPT_FCG.json"
PRIVATE_SCRIPT = ROOT / ".planning/private/demo-record/STUDIO_SCRIPT.md"
DOCS_SCRIPT = ROOT / "docs/DEMO_VIDEO_SCRIPT.md"
RECEIPTS = ROOT / ".planning/receipts.jsonl"
LEDGER = ROOT / ".planning/conversation_turns/turns.jsonl"


def fco_leaf(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(b"\x00" + data).hexdigest()


def canon(obj: dict) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode(
        "utf-8"
    )


def mmr_bag(leaves: list[str]) -> str:
    """Right-fold bag: tip = H(0x01 || left || right) iteratively from left."""
    if not leaves:
        return fco_leaf(b"")
    acc = leaves[0]
    for nxt in leaves[1:]:
        payload = b"\x01" + acc.encode() + b"||" + nxt.encode()
        acc = "sha256:" + hashlib.sha256(payload).hexdigest()
    return acc


def load_seeds() -> list[dict]:
    paths = sorted(SEED_DIR.glob("S*.json"))
    seeds = [json.loads(p.read_text()) for p in paths]
    seeds.sort(key=lambda s: s["ordinal"])
    return seeds


def seal(seeds: list[dict]) -> dict:
    sealed = []
    for s in seeds:
        body = {k: v for k, v in s.items()}
        leaf = fco_leaf(canon(body))
        sealed.append(
            {
                "seed_id": s["seed_id"],
                "ordinal": s["ordinal"],
                "path": f".planning/quick/260724-braintona-hacksprint/demo_script_seeds/{s['seed_id']}.json",
                "content_leaf": leaf,
                "proves": s["proves"],
                "ui": s["ui"],
                "parents": s.get("parents", []),
                "llm_in_science_leaf": False,
            }
        )
    tip = mmr_bag([x["content_leaf"] for x in sealed])
    bag = {
        "schema": "braintona.demo_script_fcg.v1",
        "project": "braintona",
        "title": "Demo video script — seeds of truth before teleprompter",
        "updated_at_utc": datetime.now(timezone.utc).isoformat(),
        "rule": "Seeds sealed first; teleprompter is compile-only from seed.say",
        "n_seeds": len(sealed),
        "seeds": sealed,
        "mmr_tip": tip,
        "signed": False,
        "pi_seal": False,
        "llm_in_science_leaf": False,
        "authority": {
            "claim_promotion": False,
            "writeback": False,
            "pi_sign": False,
        },
    }
    BAG_PATH.parent.mkdir(parents=True, exist_ok=True)
    BAG_PATH.write_text(json.dumps(bag, indent=2) + "\n")
    return bag


def compile_script(seeds: list[dict], bag: dict) -> str:
    by_id = {s["seed_id"]: s for s in seeds}
    leaf_by = {x["seed_id"]: x["content_leaf"] for x in bag["seeds"]}

    def say(sid: str) -> str:
        return by_id[sid]["say"]

    def cite(sid: str) -> str:
        return f"`{sid}` · `{leaf_by[sid][:19]}…`"

    lines = [
        "# Braintona — video teleprompter (<2 min)",
        "",
        "**Rule:** Seeds of truth sealed into app FCG *before* this file was compiled.",
        f"**Bag tip:** `{bag['mmr_tip']}`",
        "**SoT:** `.planning/quick/260724-braintona-hacksprint/demo_script_seeds/`",
        "**UI path:** pitch → pipeline → star → two-turn → finish (`Next page` only)",
        "**Studio mic OFF.** Speak on Pro.",
        "",
        "---",
        "",
        "## How to (once)",
        "",
        "```bash",
        "cd /Users/byron/projects/active/braintona",
        "set -a && source .env && set +a",
        "fireconnect cursor off",
        "npm run start",
        "# re-seal seeds if you edit say text:",
        "python3 scripts/seal_demo_script_seeds.py",
        "python3 scripts/update_fcg_bag.py",
        "```",
        "",
        "1. Left: this file · Right: http://127.0.0.1:8787/pitch.html",
        "2. Warm pipeline + star traverse + two-turn audio",
        "3. Studio ⌘⌃⇧5 · Pro QuickTime Movie Recording · countdown",
        "4. Save clips → `.planning/private/demo-record/` → combine → Devpost",
        "",
        "---",
        "",
        "## Continuous read (compiled from seeds only)",
        "",
        "Brackets = clicks. Every spoken line cites a sealed seed leaf.",
        "",
        "---",
        "",
        f"**[pitch.html — talk only]** · {cite('S01_handoff_gap')} · {cite('S02_custody_contract')}",
        "",
        say("S01_handoff_gap"),
        say("S02_custody_contract"),
        "",
        f"{cite('S03_gap_same_box')} · {cite('S04_gap_unlabeled_voice')}",
        "",
        say("S03_gap_same_box"),
        say("S04_gap_unlabeled_voice"),
        "",
        f"**[Next → / · Run live pipeline]** · {cite('S05_pipeline_stack')} · {cite('S06_daytona_fail_closed')} · {cite('S07_sponsor_fingerprints')}",
        "",
        say("S05_pipeline_stack"),
        say("S06_daytona_fail_closed"),
        say("S07_sponsor_fingerprints"),
        "",
        f"**[Next → /demo-voice-star.html · Play traverse]** · {cite('S08_voice_star_traverse')}",
        "",
        say("S08_voice_star_traverse"),
        "",
        f"**[Next → /demo-two-turn.html · Run two-turn demo]** · {cite('S09_two_leaves_vault')}",
        "",
        say("S09_two_leaves_vault"),
        "",
        f"**[Finish]** · {cite('S10_ceiling_close')}",
        "",
        say("S10_ceiling_close"),
        "",
        "**[Stop both recordings]**",
        "",
        "---",
        "",
        "## Seed index (FCG atoms)",
        "",
        "| Ord | Seed | Proves | Leaf |",
        "|---|---|---|---|",
    ]
    for x in bag["seeds"]:
        lines.append(
            f"| {x['ordinal']} | `{x['seed_id']}` | {x['proves']} | `{x['content_leaf']}` |"
        )
    lines += [
        "",
        f"**MMR tip:** `{bag['mmr_tip']}`",
        "",
        "---",
        "",
        "## If something breaks",
        "",
        "| Glitch | Keep talking (still under seed ceilings) |",
        "|---|---|",
        "| Daytona slow | Local verify green; tamper still fails closed. (`S06`) |",
        "| Eval F1 red | Eval scores quality; custody scores integrity. (`S05` ceiling) |",
        "| No audio | Skip hear-it; two labeled leaves; tip vault-private. (`S09`) |",
        "| Behind clock | Drop `S07` sentence; keep S05→S06→S08→S10 |",
        "",
    ]
    return "\n".join(lines)


def append_receipt(bag: dict) -> None:
    receipt = {
        "schema": "portfolio.interaction_receipt.v1",
        "ts": bag["updated_at_utc"],
        "event": "demo_script_seeds_sealed",
        "n_seeds": bag["n_seeds"],
        "mmr_tip": bag["mmr_tip"],
        "bag": str(BAG_PATH.relative_to(ROOT)),
        "seed_dir": str(SEED_DIR.relative_to(ROOT)),
        "compiled": [
            str(PRIVATE_SCRIPT.relative_to(ROOT)),
            str(DOCS_SCRIPT.relative_to(ROOT)),
        ],
        "llm_in_science_leaf": False,
        "note": "Demo video script atomized as seeds-of-truth inside app FCG before teleprompter compile",
    }
    with RECEIPTS.open("a", encoding="utf-8") as f:
        f.write(json.dumps(receipt, sort_keys=True) + "\n")


def main() -> None:
    seeds = load_seeds()
    if len(seeds) < 1:
        raise SystemExit(f"no seeds in {SEED_DIR}")
    bag = seal(seeds)
    text = compile_script(seeds, bag)
    PRIVATE_SCRIPT.parent.mkdir(parents=True, exist_ok=True)
    PRIVATE_SCRIPT.write_text(text)
    DOCS_SCRIPT.write_text(text)
    append_receipt(bag)
    print(
        json.dumps(
            {
                "ok": True,
                "n_seeds": bag["n_seeds"],
                "mmr_tip": bag["mmr_tip"],
                "bag": str(BAG_PATH),
                "compiled": [str(PRIVATE_SCRIPT), str(DOCS_SCRIPT)],
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
