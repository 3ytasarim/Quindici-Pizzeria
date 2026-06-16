import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { uploadFile, deleteFile, readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234!";

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
  const { username, password } = req.body ?? {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ sub: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } else {
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

export default router;
