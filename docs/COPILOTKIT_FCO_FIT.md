# CopilotKit ↔ FCO design fit

**Locked:** 2026-07-24 — CopilotKit is the most relevant HackSprint sponsor UI for Braintona’s FCO/interaction model.

## Why it fits

| FCO concept | CopilotKit surface |
|---|---|
| Interaction object (customer ↔ agent / operator ↔ custody agent) | Chat thread / generative UI session |
| Turn leaves (human vs AI) | User message vs assistant/tool message |
| Point of contact + local signature | Each tool call / action that hits Fireworks, Braintrust, Daytona, vault |
| Two trees under one MMR | Operator tree + agent tree bagged per thread |
| Claim ceiling in UI | Render provenance strip on every reply (root, sig, PoC) — not “the model is correct” |

Daytona/Braintrust/Fireworks prove **custody**. CopilotKit is where a human **drives and sees** that custody as conversation turns — same pattern as Sauna/BioCustody voice turns, but for the operator cockpit.

## Best Use path (Path C — FCO-native)

Not a generic chat widget. Wire CopilotKit so that:

1. Operator sends a message → seal **human** (or operator) turn leaf  
2. Agent/tool runs pipeline / two-avatar / graph query → seal **AI/tool** turn leaf  
3. Thread tip = MMR of turn leaves; show `signature_chain_tip` + custody root in the UI  
4. Optional: “Run verify” / “Seal voice” as CopilotKit actions that call existing `/api/*`

## Gate (operator)

License is missing. CLI reports **Not logged in.**

```bash
cd /Users/byron/projects/active/braintona
npx copilotkit@latest login          # browser
npx copilotkit@latest license create # or: license list
# Ensure COPILOTKIT_LICENSE_TOKEN lands in .env (never commit)
```

Older docs mentioned `npx copilotkit@latest license --write`; current CLI uses `license create` / `license list`.

## Non-goals until license

- Full CopilotKit scaffold rewrite of the Express demo  
- Replacing the existing button UI before a licensed chat thread seals turns  

## Done when

- [ ] `COPILOTKIT_LICENSE_TOKEN` in `.env`  
- [ ] Operator chat visible on demo  
- [ ] ≥1 human turn + ≥1 AI/tool turn sealed into interaction MMR  
- [ ] Devpost bullet: CopilotKit operator cockpit over FCO receipt stream  

## Priority vs other sponsors

Elevated above CodeRabbit Discord for **FCO design relevance**. CodeRabbit remains Path B (observe). CopilotKit is the interactive custody cockpit.
