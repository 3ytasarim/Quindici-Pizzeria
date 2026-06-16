import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads");
const META_FILE = path.join(UPLOADS_DIR, "meta.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234!";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, _file, cb) => cb(null, "mittagstisch.pdf"),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Nur PDF-Dateien erlaubt"));
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token ungültig oder abgelaufen" });
  }
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

router.post(
  "/admin/mittagstisch",
  authMiddleware,
  upload.single("pdf"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen" });
    const meta = { filename: req.file.filename, uploadedAt: new Date().toISOString() };
    fs.writeFileSync(META_FILE, JSON.stringify(meta));
    res.json({ success: true, uploadedAt: meta.uploadedAt });
  },
);

router.delete("/admin/mittagstisch", authMiddleware, (req, res) => {
  const pdfPath = path.join(UPLOADS_DIR, "mittagstisch.pdf");
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  fs.writeFileSync(META_FILE, JSON.stringify({ filename: null, uploadedAt: null }));
  res.json({ success: true });
});

export default router;
