# Private conversation custody

**Rule:** This Cursor conversation is a custody object and must be included in the session graph, but **plaintext stays private**.

## What is public
- Hash pointer: `data/private_conversation_latest.json` (gitignored with other `data/*`)
- Graph node `conversation_private` with `transcript_sha256`, `content_leaf`, `fco_root`, `mmr_tip`
- Receipt row in `.planning/receipts.jsonl` (hashes only)

## What stays private
- Cursor transcript bytes under `~/.cursor/projects/.../agent-transcripts/`
- Operator vault sidecar `.planning/private/conversation_vault_latest.json` (**gitignored**)
- No transcript body in git, Devpost, or public API JSON beyond hashes

## Seal (implemented 2026-07-24)

```bash
# Full transcript → private FCO pointer + attach to session FCG
npx tsx scripts/seal_private_conversation.ts

# Or via API
curl -sS -X POST http://127.0.0.1:8787/api/conversation/seal-private \
  -H 'content-type: application/json' \
  -d '{"note":"include this Cursor conversation as private custody"}'
```

### Per-turn FCOs (portfolio hot path)

```bash
# Human / primary_agent / system leaves → .planning/conversation_turns/
python3 scripts/emit_conversation_turn_fco.py \
  --continuous-session-id cursor-<uuid> \
  --actor-kind human --content-class human \
  --text "…" --queue-seedgraph

python3 scripts/emit_mmr_memory_event.py \
  --subtype integration_touch \
  --continuous-session-id cursor-<uuid> \
  --runtime cursor --scoring-mode mix \
  --note "conversation FCO in FCG"
```

Public graph holds **hashes only**. Re-seal after material turns so `transcript_sha256` matches live bytes.

## Claim ceiling
Conversation custody proves *that* a continuous session existed and its byte hash — not that model text is science truth (`llm_in_science_leaf: false`).
