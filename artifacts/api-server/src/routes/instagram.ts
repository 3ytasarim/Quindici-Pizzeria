import { Router } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

const router = Router();

router.get("/instagram/posts", async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return res.json({ posts: [], configured: false });

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=3&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) {
      const err = await response.json();
      req.log.error({ err }, "Instagram API error");
      return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
    }
    const data = await response.json() as { data: unknown[] };
    return res.json({ posts: data.data ?? [], configured: true });
  } catch (err) {
    req.log.error({ err }, "Instagram fetch failed");
    return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
  }
});

router.post("/admin/instagram/exchange-token", authMiddleware, async (req, res) => {
  const { shortToken } = req.body as { shortToken?: string };
  if (!shortToken?.trim()) {
    return res.status(400).json({ error: "Kein Token angegeben" });
  }

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;

  if (!appId || !appSecret) {
    return res.status(500).json({ error: "App-Konfiguration fehlt (INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET)" });
  }

  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortToken.trim())}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!response.ok || !data.access_token) {
      req.log.error({ data }, "Token exchange failed");
      return res.status(400).json({
        error: data?.error?.message ?? "Token-Austausch fehlgeschlagen",
        fbtrace: data?.error?.fbtrace_id,
      });
    }

    return res.json({
      longLivedToken: data.access_token,
      tokenType: data.token_type,
      expiresInDays: Math.round((data.expires_in ?? 5184000) / 86400),
    });
  } catch (err) {
    req.log.error({ err }, "Token exchange error");
    return res.status(500).json({ error: "Serverfehler beim Token-Austausch" });
  }
});

export default router;
