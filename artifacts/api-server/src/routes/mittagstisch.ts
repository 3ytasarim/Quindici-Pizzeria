import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads");
const META_FILE = path.join(UPLOADS_DIR, "meta.json");
const PDF_PATH = path.join(UPLOADS_DIR, "mittagstisch.pdf");

const router = Router();

router.get("/mittagstisch", (_req, res) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
    const exists = meta.filename && fs.existsSync(PDF_PATH);
    res.json({ available: !!exists, uploadedAt: meta.uploadedAt ?? null });
  } catch {
    res.json({ available: false, uploadedAt: null });
  }
});

router.get("/mittagstisch/pdf", (_req, res) => {
  if (!fs.existsSync(PDF_PATH)) {
    return res.status(404).json({ error: "Kein Mittagstisch-PDF verfügbar" });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=mittagstisch.pdf");
  fs.createReadStream(PDF_PATH).pipe(res);
});

export default router;
