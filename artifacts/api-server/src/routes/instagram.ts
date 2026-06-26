import { Router } from "express";
import jwt from "jsonwebtoken";
import { readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const CONFIG_PATH = "config/instagram.json";

interface InstagramConfig { accessToken: string; savedAt: string; expiresInDays: number }

function auth(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
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

const router = Router();

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

router.post("/admin/instagram/save-direct", auth, async (req, res) => {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken?.trim()) return res.status(400).json({ error: "Kein Token" });
  try {
    await writeJSON(CONFIG_PATH, { accessToken: accessToken.trim(), savedAt: new Date().toISOString(), expiresInDays: 60 } satisfies InstagramConfig);
    req.log.info("Instagram token saved directly");
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Direct save error");
    return res.status(500).json({ error: "Serverfehler" });
  }
});

router.post("/admin/instagram/save-token", auth, async (req, res) => {
  const { shortToken } = req.body as { shortToken?: string };
  if (!shortToken?.trim()) return res.status(400).json({ error: "Kein Token" });

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appId || !appSecret) return res.status(500).json({ error: "App-Konfiguration fehlt" });

  try {
    const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortToken.trim())}`;
    const r = await fetch(exchangeUrl);
    const d = await r.json() as any;
    if (!d.access_token) {
      req.log.error({ d }, "Exchange failed");
      return res.status(400).json({ error: d?.error?.message ?? "Exchange fehlgeschlagen" });
    }
    const expiresInDays = Math.round((d.expires_in ?? 5184000) / 86400);
    await writeJSON(CONFIG_PATH, { accessToken: d.access_token, savedAt: new Date().toISOString(), expiresInDays } satisfies InstagramConfig);
    req.log.info({ expiresInDays }, "Instagram token saved");
    return res.json({ success: true, expiresInDays });
  } catch (err) {
    req.log.error({ err }, "Save token error");
    return res.status(500).json({ error: "Serverfehler" });
  }
});

export default router;
