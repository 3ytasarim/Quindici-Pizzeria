import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import path from "path";
import { uploadFile, deleteFile, readJSON, writeJSON } from "../lib/gcs";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

const DEFAULTS = [
  { id: "default-1", label: "Margherita",         imageUrl: "/pizza-1.png", isDefault: true },
  { id: "default-2", label: "Diavola",             imageUrl: "/pizza-2.png", isDefault: true },
  { id: "default-3", label: "Quattro Formaggi",    imageUrl: "/pizza-3.png", isDefault: true },
  { id: "default-4", label: "Prosciutto e Rucola", imageUrl: "/pizza-4.png", isDefault: true },
];

async function readList(): Promise<any[]> {
  const raw = await readJSON<any[]>("pizza");
  if (Array.isArray(raw) && raw.length > 0) return raw;
  await writeJSON("pizza", DEFAULTS);
  return DEFAULTS;
}
async function saveList(data: any[]) {
  await writeJSON("pizza", data);
}

function auth(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.get("/pizza", async (_req, res) => {
  res.json(await readList());
});

router.post("/admin/pizza", auth, upload.single("image"), async (req, res) => {
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = imageUrl ?? "";
  if (req.file) {
    const ext = path.extname(req.file.originalname) || ".jpg";
    finalUrl = await uploadFile("pizza", req.file.buffer, ext, req.file.mimetype);
  }
  if (!finalUrl) return res.status(400).json({ error: "Bild erforderlich" });
  const list = await readList();
  const item = { id: randomUUID(), label: label ?? "", imageUrl: finalUrl, isDefault: false, createdAt: new Date().toISOString() };
  list.push(item);
  await saveList(list);
  res.status(201).json(item);
});

router.put("/admin/pizza/:id", auth, upload.single("image"), async (req, res) => {
  const list = await readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = list[idx].imageUrl;
  if (req.file) {
    if (!list[idx].isDefault) await deleteFile(list[idx].imageUrl);
    const ext = path.extname(req.file.originalname) || ".jpg";
    finalUrl = await uploadFile("pizza", req.file.buffer, ext, req.file.mimetype);
  } else if (imageUrl) {
    finalUrl = imageUrl;
  }
  list[idx] = { ...list[idx], label: label ?? list[idx].label, imageUrl: finalUrl, isDefault: false };
  await saveList(list);
  res.json(list[idx]);
});

router.delete("/admin/pizza/:id", auth, async (req, res) => {
  const list = await readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  if (!list[idx].isDefault) await deleteFile(list[idx].imageUrl);
  list.splice(idx, 1);
  await saveList(list);
  res.json({ success: true });
});

router.patch("/admin/pizza/:id/move", auth, async (req, res) => {
  const { direction } = req.body ?? {};
  const list = await readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  if (direction === "up" && idx > 0) {
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
  } else if (direction === "down" && idx < list.length - 1) {
    [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
  }
  await saveList(list);
  res.json(list);
});

export default router;
