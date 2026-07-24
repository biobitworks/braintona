# D17.4 — Greenfield app + WorkOS free URL (candidate)

**Status:** candidate — needs OPERATOR GO before scaffolding  
**Locked:** 2026-07-24T17:16:29Z

## Operator lock

We may need to **build a new app from scratch**. WorkOS might provide a **free URL**.

## What WorkOS actually gives (verified from docs)

| Thing | Fact |
|---|---|
| Staging AuthKit host | Free WorkOS-generated `*.authkit.app` subdomain (e.g. `youthful-ginger-43.authkit.app`) |
| Custom domain | Paid, **production-only** — not free; not available on staging |
| AuthKit MAUs | First 1M MAUs free per current WorkOS pricing page — **re-verify before commit** |
| Role here | Optional identity (AuthKit) — **not** Merkle-root vault, **not** FCO SoT |

Sources: [AuthKit domain](https://workos.com/docs/custom-domains/authkit), [Custom domains](https://workos.com/docs/custom-domains), [Pricing](https://workos.com/pricing).

## Why greenfield may be needed

D17–D17.3a (multi-sponsor FCO/FCG, PHI privacy, BYOM Pythia, user-vault Merkle root like a Bitcoin wallet, GTM-viable) may need a clean product surface rather than stretching `bioviz-tech` `/cellico/*` alone.

## Hard boundaries

- Private Merkle root stays in the **user’s vault** (Bitcoin-wallet style) — never in WorkOS.
- WorkOS = optional sign-in; do **not** gate the demo behind auth (same pattern as Braintona).
- No new repo / DNS / production WorkOS until OPERATOR GO.
- `bioviz-tech` remains the public pitch facade until then.

## Next (only after GO)

1. Name repo + custody lane  
2. Scaffold AuthKit against staging `*.authkit.app`  
3. Wire FCO/FCG + user-vault root UX + PHI non-ingest  
4. Keep sponsor/BYOM story portable
