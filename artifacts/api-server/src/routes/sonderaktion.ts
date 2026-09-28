import { Router } from "express";
import { readJSON } from "../lib/gcs";
import { streamFile } from "../lib/gcs";

export interface SonderaktionMeta {
  filename: string | null;
  uploadedAt: string | null;
  gcsUrl?: string | null;
  label?: string;
}

export const SONDERAKTION_KEY = "sonderaktion-meta";
export const SONDERAKTION_DEFAULT_LABEL = "Sonderaktion";

const router = Router();

router.get("/sonderaktion", async (_req, res) => {
  try {
    const meta = await readJSON<SonderaktionMeta>(SONDERAKTION_KEY);
    res.json({
      available: !!(meta?.gcsUrl),
      uploadedAt: meta?.uploadedAt ?? null,
      label: meta?.label?.trim() || SONDERAKTION_DEFAULT_LABEL,
    });
  } catch {
    res.json({ available: false, uploadedAt: null, label: SONDERAKTION_DEFAULT_LABEL });
  }
});

router.get("/sonderaktion/pdf", async (_req, res) => {
  const meta = await readJSON<SonderaktionMeta>(SONDERAKTION_KEY);
  if (!meta?.gcsUrl) return res.status(404).json({ error: "Kein Sonderaktion-PDF verfügbar" });
  res.setHeader("Content-Disposition", "inline; filename=sonderaktion.pdf");
  const relative = meta.gcsUrl.slice("/api/files/".length);
  await streamFile(relative, res);
});

export default router;
