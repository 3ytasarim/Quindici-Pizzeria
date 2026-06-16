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
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

async function readGallery(): Promise<any[]> {
  return (await readJSON<any[]>("gallery")) ?? [];
}
async function writeGallery(data: any[]) {
  await writeJSON("gallery", data);
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.get("/gallery", async (_req, res) => {
  res.json(await readGallery());
});

router.post("/admin/gallery", authMiddleware, upload.single("image"), async (req, res) => {
  const { title, imageUrl } = req.body ?? {};
  let finalUrl = imageUrl ?? "";
  if (req.file) {
    const ext = path.extname(req.file.originalname) || ".jpg";
    finalUrl = await uploadFile("gallery", req.file.buffer, ext, req.file.mimetype);
  }
  if (!finalUrl) return res.status(400).json({ error: "Bild erforderlich" });
  const list = await readGallery();
  const item = { id: randomUUID(), title: title ?? "", imageUrl: finalUrl, createdAt: new Date().toISOString() };
  list.push(item);
  await writeGallery(list);
  res.status(201).json(item);
});

router.put("/admin/gallery/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const list = await readGallery();
  const idx = list.findIndex((g: any) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { title, imageUrl } = req.body ?? {};
  let finalUrl = list[idx].imageUrl;
  if (req.file) {
    await deleteFile(list[idx].imageUrl);
    const ext = path.extname(req.file.originalname) || ".jpg";
    finalUrl = await uploadFile("gallery", req.file.buffer, ext, req.file.mimetype);
  } else if (imageUrl) {
    finalUrl = imageUrl;
  }
  list[idx] = { ...list[idx], title: title ?? list[idx].title, imageUrl: finalUrl };
  await writeGallery(list);
  res.json(list[idx]);
});

router.delete("/admin/gallery/:id", authMiddleware, async (req, res) => {
  const list = await readGallery();
  const idx = list.findIndex((g: any) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  await deleteFile(list[idx].imageUrl);
  list.splice(idx, 1);
  await writeGallery(list);
  res.json({ success: true });
});

export default router;
