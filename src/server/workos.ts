/**
 * WorkOS AuthKit — local-first optional auth.
 * Demo APIs stay public; sign-in is additive for judge/operator identity.
 * Migrate WORKOS_REDIRECT_URI to custom domain when hackathon domain is redeemed.
 */
import type { Express, Request, Response } from "express";
import { WorkOS } from "@workos-inc/node";

const COOKIE = "wos-session";

export function workosEnabled(): boolean {
  return Boolean(
    process.env.WORKOS_API_KEY && process.env.WORKOS_CLIENT_ID && process.env.WORKOS_COOKIE_PASSWORD,
  );
}

function client(): WorkOS {
  return new WorkOS(process.env.WORKOS_API_KEY!, {
    clientId: process.env.WORKOS_CLIENT_ID!,
  });
}

function redirectUri(): string {
  return process.env.WORKOS_REDIRECT_URI || "http://127.0.0.1:8787/callback";
}

function homeUrl(): string {
  return process.env.WORKOS_HOME_URL || "http://127.0.0.1:8787/";
}

function cookieOpts() {
  const secure = process.env.WORKOS_COOKIE_SECURE === "true";
  return {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
  };
}

export async function getSessionUser(req: Request): Promise<{
  authenticated: boolean;
  user?: { id: string; email?: string | null; firstName?: string | null; lastName?: string | null };
  reason?: string;
}> {
  if (!workosEnabled()) return { authenticated: false, reason: "workos_not_configured" };
  const raw = req.cookies?.[COOKIE];
  if (!raw) return { authenticated: false, reason: "no_session_cookie_provided" };
  try {
    const session = client().userManagement.loadSealedSession({
      sessionData: raw,
      cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
    });
    const result = await session.authenticate();
    if (result.authenticated) {
      return {
        authenticated: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        },
      };
    }
    return { authenticated: false, reason: "unauthenticated" };
  } catch {
    return { authenticated: false, reason: "session_error" };
  }
}

async function handleLogout(req: Request, res: Response) {
  try {
    const raw = req.cookies?.[COOKIE];
    if (raw && workosEnabled()) {
      const session = client().userManagement.loadSealedSession({
        sessionData: raw,
        cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
      });
      const url = await session.getLogoutUrl({ returnTo: homeUrl() });
      res.clearCookie(COOKIE, cookieOpts());
      return res.redirect(url);
    }
  } catch (err) {
    console.warn("[workos] logout fallback", err);
  }
  res.clearCookie(COOKIE, cookieOpts());
  res.redirect("/");
}

export function mountWorkosRoutes(app: Express) {
  app.get("/api/auth/status", async (req, res) => {
    const status = await getSessionUser(req);
    res.json({
      enabled: workosEnabled(),
      ...status,
      redirect_uri: redirectUri(),
      note: "Local-first AuthKit. Demo routes remain public; migrate redirect URI when WorkOS domain lands.",
    });
  });

  if (!workosEnabled()) {
    app.get("/login", (_req, res) => {
      res
        .status(503)
        .send("WorkOS not configured. Set WORKOS_API_KEY, WORKOS_CLIENT_ID, WORKOS_COOKIE_PASSWORD.");
    });
    return;
  }

  const workos = client();

  app.get("/login", (_req, res) => {
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      provider: "authkit",
      redirectUri: redirectUri(),
      clientId: process.env.WORKOS_CLIENT_ID!,
    });
    res.redirect(authorizationUrl);
  });

  app.get("/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) return res.status(400).send("No code provided");
    try {
      const auth = await workos.userManagement.authenticateWithCode({
        code,
        clientId: process.env.WORKOS_CLIENT_ID!,
        session: {
          sealSession: true,
          cookiePassword: process.env.WORKOS_COOKIE_PASSWORD!,
        },
      });
      if (auth.sealedSession) {
        res.cookie(COOKIE, auth.sealedSession, cookieOpts());
      }
      return res.redirect("/");
    } catch (err) {
      console.error("[workos] callback failed", err);
      return res.redirect("/login");
    }
  });

  app.post("/logout", handleLogout);
  app.get("/logout", handleLogout);
}
