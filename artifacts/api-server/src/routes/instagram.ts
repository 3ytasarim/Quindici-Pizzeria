import { Router } from "express";
import jwt from "jsonwebtoken";
import { readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const CONFIG_PATH = "config/instagram.json";

interface InstagramConfig { accessToken: string; savedAt: string; expiresInDays: number }
const PINNED_PATH = "config/instagram-pinned.json";

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

async function fetchAllMedia(token: string) {
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&limit=20&access_token=${token}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Instagram API error");
  const d = await r.json() as { data: { id: string; timestamp?: string }[] };
  return (d.data ?? []).sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());
}

router.get("/instagram/posts", async (req, res) => {
  const token = await getAccessToken();
  if (!token) return res.json({ posts: [], configured: false });
  try {
    const all = await fetchAllMedia(token);
    // Check if admin has pinned specific posts
    try {
      const pinned = await readJSON<{ ids: string[] }>(PINNED_PATH);
      if (pinned?.ids?.length) {
        const map = new Map(all.map((p) => [p.id, p]));
        const selected = pinned.ids.map((id) => map.get(id)).filter(Boolean);
        if (selected.length > 0) return res.json({ posts: selected.slice(0, 3), configured: true });
      }
    } catch (_) {}
    return res.json({ posts: all.slice(0, 3), configured: true });
  } catch (err) {
    req.log.error({ err }, "Instagram fetch failed");
    return res.json({ posts: [], configured: true, error: "Fehler beim Laden" });
  }
});

router.get("/admin/instagram/all-posts", auth, async (req, res) => {
  const token = await getAccessToken();
  if (!token) return res.status(400).json({ error: "Kein Token konfiguriert" });
  try {
    const all = await fetchAllMedia(token);
    const pinned = await readJSON<{ ids: string[] }>(PINNED_PATH).catch(() => null);
    return res.json({ posts: all, pinnedIds: pinned?.ids ?? [] });
  } catch (err) {
    req.log.error({ err }, "Fetch all posts failed");
    return res.status(500).json({ error: "Fehler beim Laden" });
  }
});

router.post("/admin/instagram/pinned", auth, async (req, res) => {
  const { ids } = req.body as { ids?: string[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids fehlt" });
  try {
    await writeJSON(PINNED_PATH, { ids: ids.slice(0, 3) });
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Save pinned error");
    return res.status(500).json({ error: "Serverfehler" });
  }
});

router.get("/admin/instagram/status", auth, async (req, res) => {
  try {
    const cfg = await readJSON<InstagramConfig>(CONFIG_PATH);
    if (!cfg?.accessToken) return res.json({ configured: false, savedAt: null, expiresInDays: null });
    const savedAt = cfg.savedAt ?? null;
    let expiresInDays: number | null = null;
    if (savedAt && cfg.expiresInDays) {
      const elapsed = (Date.now() - new Date(savedAt).getTime()) / 86400000;
      expiresInDays = Math.max(0, Math.round(cfg.expiresInDays - elapsed));
    }
    return res.json({ configured: true, savedAt, expiresInDays });
  } catch {
    return res.json({ configured: false, savedAt: null, expiresInDays: null });
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
