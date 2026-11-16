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
  /** false = auf der Website ausgeblendet. Fehlt das Feld (Altdaten), gilt der Eintrag als aktiv. */
  active?: boolean;
}

const isActive = (e: Event) => e.active !== false;
const parseActive = (v: unknown, fallback: boolean) =>
  v === undefined ? fallback : v === true || v === "true" || v === "1";

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
  res.json((await readEvents()).filter(isActive));
});

// ── Admin — list (inkl. inaktive) ─────────────────────────────────────────────

router.get("/admin/events", authMiddleware, async (_req, res) => {
  res.json(await readEvents());
});

// ── Admin — reorder (muss vor "/admin/events/:id" registriert sein) ───────────

router.put("/admin/events/reorder", authMiddleware, async (req, res) => {
  // body: { ids: string[] }  — full ordered list of event IDs
  const { ids } = req.body ?? {};
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids erwartet" });
  const events = await readEvents();
  const byId = new Map(events.map((e) => [e.id, e]));
  const reordered: Event[] = [];
  for (const id of ids) {
    const ev = byId.get(id);
    if (ev) { reordered.push(ev); byId.delete(id); }
  }
  // Einträge, die nicht in ids vorkommen, bleiben erhalten (am Ende)
  reordered.push(...byId.values());
  const renumbered = reordered.map((e, i) => ({ ...e, order: i }));
  await writeEvents(renumbered);
  res.json(renumbered);
});

// ── Admin — aktiv / inaktiv ───────────────────────────────────────────────────

router.patch("/admin/events/:id/active", authMiddleware, async (req, res) => {
  const { active } = req.body ?? {};
  if (typeof active !== "boolean") return res.status(400).json({ error: "active (boolean) erwartet" });
  const events = await readEvents();
  const idx = events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  events[idx] = { ...events[idx], active };
  await writeEvents(events);
  res.json(events[idx]);
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
      active: parseActive(req.body?.active, true),
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
      active: parseActive(req.body?.active, isActive(events[idx])),
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

export default router;
