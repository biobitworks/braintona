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

## Seal

```bash
curl -sS -X POST http://127.0.0.1:8787/api/conversation/seal-private \
  -H 'content-type: application/json' \
  -d '{"note":"include this Cursor conversation as private custody"}'
```

Or: `npx tsx scripts/seal_private_conversation.ts`

## Claim ceiling
Conversation custody proves *that* a continuous session existed and its byte hash — not that model text is science truth (`llm_in_science_leaf: false`).
