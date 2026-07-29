import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import path from "path";
import { uploadFile, deleteFile, readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig oder abgelaufen" }); }
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  order: number;
}

async function readEvents(): Promise<Event[]> {
  const data = await readJSON<Event[]>("events");
  if (!data) return [];
  return [...data].sort((a, b) => a.order - b.order);
}
async function writeEvents(events: Event[]) {
  await writeJSON("events", events);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────

router.get("/events", async (_req, res) => {
  res.json(await readEvents());
});

// ── Admin — CRUD ──────────────────────────────────────────────────────────────

router.post(
  "/admin/events",
  authMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    const { title, description } = req.body ?? {};
    if (!title) return res.status(400).json({ error: "Titel ist erforderlich" });
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const events = await readEvents();
    let imageUrl = "";
    let pdfUrl = "";

    if (files?.image?.[0]) {
      const f = files.image[0];
      imageUrl = await uploadFile("events", f.buffer, path.extname(f.originalname) || ".jpg", f.mimetype);
    }
    if (files?.pdf?.[0]) {
      const f = files.pdf[0];
      pdfUrl = await uploadFile("events-pdf", f.buffer, ".pdf", "application/pdf");
    }

    const event: Event = {
      id: randomUUID(),
      title,
      description: description ?? "",
      imageUrl,
      pdfUrl,
      order: events.length,
    };
    events.push(event);
    await writeEvents(events);
    res.status(201).json(event);
  }
);

router.put(
  "/admin/events/:id",
  authMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });

    const { title, description } = req.body ?? {};
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    let { imageUrl, pdfUrl } = events[idx];

    if (files?.image?.[0]) {
      await deleteFile(imageUrl);
      const f = files.image[0];
      imageUrl = await uploadFile("events", f.buffer, path.extname(f.originalname) || ".jpg", f.mimetype);
    }
    if (files?.pdf?.[0]) {
      await deleteFile(pdfUrl);
      const f = files.pdf[0];
      pdfUrl = await uploadFile("events-pdf", f.buffer, ".pdf", "application/pdf");
    }

    events[idx] = {
      ...events[idx],
      title: title ?? events[idx].title,
      description: description ?? events[idx].description,
      imageUrl,
      pdfUrl,
    };
    await writeEvents(events);
    res.json(events[idx]);
  }
);

router.delete("/admin/events/:id", authMiddleware, async (req, res) => {
  const events = await readEvents();
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const [removed] = events.splice(idx, 1);
  await deleteFile(removed.imageUrl);
  await deleteFile(removed.pdfUrl);
  // Renumber order
  events.forEach((e, i) => { e.order = i; });
  await writeEvents(events);
  res.json({ success: true });
});

// ── Admin — reorder ───────────────────────────────────────────────────────────

router.put("/admin/events/reorder", authMiddleware, async (req, res) => {
  // body: { ids: string[] }  — full ordered list of event IDs
  const { ids } = req.body ?? {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids erwartet" });
  const events = await readEvents();
  const reordered: Event[] = [];
  for (let i = 0; i < ids.length; i++) {
    const ev = events.find((e) => e.id === ids[i]);
    if (ev) reordered.push({ ...ev, order: i });
  }
  await writeEvents(reordered);
  res.json(reordered);
});

export default router;
