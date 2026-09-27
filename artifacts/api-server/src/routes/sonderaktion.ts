import { Router } from "express";
import { readJSON } from "../lib/gcs";
import { streamFile } from "../lib/gcs";

interface PdfMeta { filename: string | null; uploadedAt: string | null; gcsUrl?: string | null }

const router = Router();

router.get("/sonderaktion", async (_req, res) => {
  try {
    const meta = await readJSON<PdfMeta>("sonderaktion-meta");
    res.json({ available: !!(meta?.gcsUrl), uploadedAt: meta?.uploadedAt ?? null });
  } catch {
    res.json({ available: false, uploadedAt: null });
  }
});

router.get("/sonderaktion/pdf", async (_req, res) => {
  const meta = await readJSON<PdfMeta>("sonderaktion-meta");
  if (!meta?.gcsUrl) return res.status(404).json({ error: "Kein Sonderaktion-PDF verfügbar" });
  res.setHeader("Content-Disposition", "inline; filename=sonderaktion.pdf");
  const relative = meta.gcsUrl.slice("/api/files/".length);
  await streamFile(relative, res);
});

export default router;
