import { Router } from "express";
import jwt from "jsonwebtoken";
import { readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const CONFIG_PATH = "config/instagram.json";

interface InstagramConfig {
  accessToken: string;
  savedAt: string;
  expiresInDays: number;
}

function authMiddleware(req: any, res: any, next: any) {
  // Accept JWT from Authorization header OR ?t= query param (for redirect flows)
  const token = req.headers["authorization"]?.replace("Bearer ", "") ?? req.query.t;
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

async function getAccessToken(): Promise<string | null> {
  try {
    const cfg = await readJSON<InstagramConfig>(CONFIG_PATH);
    if (cfg?.accessToken) return cfg.accessToken;
  } catch (_) {}
  return process.env.INSTAGRAM_ACCESS_TOKEN ?? null;
}

function getCallbackUri(): string {
  const domain = process.env.REPLIT_DOMAINS ?? process.env.REPLIT_DEV_DOMAIN ?? "localhost:8080";
  return `https://${domain}/api/admin/instagram/callback`;
}

const router = Router();

// ── Public: fetch posts ──────────────────────────────────────────────────────
router.get("/instagram/posts", async (req, res) => {
  const token = await getAccessToken();
  if (!token) return res.json({ posts: [], configured: false });

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=3&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      req.log.error({ body: await response.json() }, "Instagram API error");
      return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
    }
    const data = await response.json() as { data: unknown[] };
    return res.json({ posts: data.data ?? [], configured: true });
  } catch (err) {
    req.log.error({ err }, "Instagram fetch failed");
    return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
  }
});

// ── Admin: connection status ─────────────────────────────────────────────────
router.get("/admin/instagram/status", authMiddleware, async (_req, res) => {
  try {
    const cfg = await readJSON<InstagramConfig>(CONFIG_PATH);
    if (cfg?.accessToken) {
      return res.json({ configured: true, savedAt: cfg.savedAt, expiresInDays: cfg.expiresInDays });
    }
  } catch (_) {}
  return res.json({ configured: !!process.env.INSTAGRAM_ACCESS_TOKEN, savedAt: null, expiresInDays: null });
});

// ── Admin: start OAuth flow (protected) ─────────────────────────────────────
router.get("/admin/instagram/auth", authMiddleware, (_req, res) => {
  const appId = process.env.INSTAGRAM_APP_ID;
  if (!appId) return res.status(500).send("INSTAGRAM_APP_ID nicht konfiguriert");

  const redirectUri = encodeURIComponent(getCallbackUri());
  const scope = "instagram_basic,pages_show_list";
  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  res.redirect(oauthUrl);
});

// ── Public: OAuth callback from Facebook ─────────────────────────────────────
router.get("/admin/instagram/callback", async (req, res) => {
  const { code, error: fbError } = req.query as { code?: string; error?: string };

  if (fbError || !code) {
    return res.redirect(`/?instagram=error&reason=${encodeURIComponent(fbError ?? "no_code")}`);
  }

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) {
    return res.redirect("/?instagram=error&reason=missing_config");
  }

  try {
    const callbackUri = getCallbackUri();

    // Exchange code → short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(callbackUri)}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json() as any;
    if (!tokenData.access_token) {
      req.log.error({ tokenData }, "Code exchange failed");
      return res.redirect(`/?instagram=error&reason=${encodeURIComponent(tokenData?.error?.message ?? "exchange_failed")}`);
    }

    // Exchange short-lived → long-lived (60 days)
    const llRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const llData = await llRes.json() as any;
    const finalToken = llData.access_token ?? tokenData.access_token;
    const expiresInDays = Math.round((llData.expires_in ?? 5184000) / 86400);

    // Save to GCS
    await writeJSON(CONFIG_PATH, {
      accessToken: finalToken,
      savedAt: new Date().toISOString(),
      expiresInDays,
    } satisfies InstagramConfig);

    req.log.info({ expiresInDays }, "Instagram token saved");
    return res.redirect("/admin?instagram=success");
  } catch (err) {
    req.log.error({ err }, "OAuth callback error");
    return res.redirect("/?instagram=error&reason=server_error");
  }
});

export default router;
