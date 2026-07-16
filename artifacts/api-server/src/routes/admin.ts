import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { uploadFile, deleteFile, readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

// Brute-force protection — configurable via env vars
const MAX_ATTEMPTS = parseInt(process.env.LOGIN_MAX_ATTEMPTS ?? "5", 10);
const WINDOW_MS    = parseInt(process.env.LOGIN_WINDOW_MS   ?? String(15 * 60 * 1000), 10);
const LOCKOUT_MS   = parseInt(process.env.LOGIN_LOCKOUT_MS  ?? String(WINDOW_MS), 10);

interface AttemptRecord { count: number; windowStart: number; lockedUntil: number }
const failedAttempts = new Map<string, AttemptRecord>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const rec = failedAttempts.get(ip);

  if (rec && now < rec.lockedUntil) {
    return { allowed: false, retryAfterMs: rec.lockedUntil - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const rec = failedAttempts.get(ip);

  if (!rec || now - rec.windowStart > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    return;
  }

  rec.count += 1;
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_MS;
  }
}

function resetFailures(ip: string): void {
  failedAttempts.delete(ip);
}

/** Exported only for unit tests — clears all in-memory state. */
export function _clearAllFailedAttempts(): void {
  failedAttempts.clear();
}

interface PdfMeta { filename: string | null; uploadedAt: string | null; gcsUrl?: string | null }

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Nur PDF-Dateien erlaubt"));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig oder abgelaufen" }); }
}

const router = Router();

router.post("/admin/login", (req, res) => {
  const ip = req.ip ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);

  if (!allowed) {
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: "Zu viele Anmeldeversuche. Bitte später erneut versuchen.",
      retryAfterSeconds: retryAfterSec,
    });
  }

  const { username, password } = req.body ?? {};
  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(503).json({ error: "Admin-Zugangsdaten nicht konfiguriert" });
  }
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    resetFailures(ip);
    const token = jwt.sign({ sub: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } else {
    recordFailure(ip);
    res.status(401).json({ error: "Ungültige Zugangsdaten" });
  }
});

router.post("/admin/mittagstisch", authMiddleware, upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen" });
  const gcsUrl = await uploadFile("pdf", req.file.buffer, ".pdf", "application/pdf");
  const meta: PdfMeta = { filename: "mittagstisch.pdf", uploadedAt: new Date().toISOString(), gcsUrl };
  await writeJSON("mittagstisch-meta", meta);
  res.json({ success: true, uploadedAt: meta.uploadedAt });
});

router.get("/admin/mittagstisch/meta", authMiddleware, async (_req, res) => {
  const meta = await readJSON<PdfMeta>("mittagstisch-meta");
  res.json(meta ?? { filename: null, uploadedAt: null, gcsUrl: null });
});

router.delete("/admin/mittagstisch", authMiddleware, async (_req, res) => {
  const meta = await readJSON<PdfMeta>("mittagstisch-meta");
  if (meta?.gcsUrl) await deleteFile(meta.gcsUrl);
  await writeJSON("mittagstisch-meta", { filename: null, uploadedAt: null, gcsUrl: null });
  res.json({ success: true });
});

interface SeoPage { title: string; description: string; keywords: string; }
interface SeoConfig {
  pages: Record<string, SeoPage>;
  google: { analyticsId: string; adsId: string; searchConsoleVerification: string; };
}

const SEO_DEFAULTS: SeoConfig = {
  pages: {
    home:        { title: "", description: "", keywords: "" },
    speisekarte: { title: "", description: "", keywords: "" },
    "ueber-uns": { title: "", description: "", keywords: "" },
    kontakt:     { title: "", description: "", keywords: "" },
    impressum:   { title: "", description: "", keywords: "" },
    datenschutz: { title: "", description: "", keywords: "" },
  },
  google: { analyticsId: "", adsId: "", searchConsoleVerification: "" },
};

router.get("/seo", async (_req, res) => {
  const cfg = await readJSON<SeoConfig>("config/seo");
  res.json(cfg ?? SEO_DEFAULTS);
});

router.get("/admin/seo", authMiddleware, async (_req, res) => {
  const cfg = await readJSON<SeoConfig>("config/seo");
  res.json(cfg ?? SEO_DEFAULTS);
});

router.post("/admin/seo", authMiddleware, async (req, res) => {
  const body = req.body as SeoConfig;
  await writeJSON("config/seo", body);
  res.json({ success: true });
});

export default router;
