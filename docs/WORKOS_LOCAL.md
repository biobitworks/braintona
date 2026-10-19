# WorkOS local-first setup

## Already configured in app
- `@workos-inc/node` AuthKit routes: `/login`, `/callback`, `/logout`, `/api/auth/status`
- Demo APIs stay **public** (auth is optional)
- Env: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`, `WORKOS_REDIRECT_URI=http://127.0.0.1:8787/callback`

## Dashboard (one-time)
In [WorkOS Dashboard → Redirects](https://dashboard.workos.com):

1. **Redirect URI:** `http://127.0.0.1:8787/callback`
2. **Sign-in endpoint:** `http://127.0.0.1:8787/login`
3. **Sign-out redirect:** `http://127.0.0.1:8787/`

## Migrate later
When the hackathon custom domain is redeemed, change `WORKOS_REDIRECT_URI` / dashboard redirects to the public URL — same code path.
