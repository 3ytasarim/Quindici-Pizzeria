import { Router } from "express";
import { readJSON } from "../lib/gcs";
import { streamFile } from "../lib/gcs";

interface PdfMeta { filename: string | null; uploadedAt: string | null; gcsUrl?: string | null }

const router = Router();

router.get("/mittagstisch", async (_req, res) => {
  try {
    const meta = await readJSON<PdfMeta>("mittagstisch-meta");
    res.json({ available: !!(meta?.gcsUrl), uploadedAt: meta?.uploadedAt ?? null });
  } catch {
    res.json({ available: false, uploadedAt: null });
  }
});

router.get("/mittagstisch/pdf", async (_req, res) => {
  const meta = await readJSON<PdfMeta>("mittagstisch-meta");
  if (!meta?.gcsUrl) return res.status(404).json({ error: "Kein Mittagstisch-PDF verfügbar" });
  res.setHeader("Content-Disposition", "inline; filename=mittagstisch.pdf");
  const relative = meta.gcsUrl.slice("/api/files/".length);
  await streamFile(relative, res);
});

export default router;
