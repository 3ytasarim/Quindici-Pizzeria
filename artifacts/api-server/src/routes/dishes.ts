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

async function readDishes(): Promise<any[]> {
  return (await readJSON<any[]>("dishes")) ?? [];
}
async function writeDishes(dishes: any[]) {
  await writeJSON("dishes", dishes);
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Nur Bilddateien erlaubt"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/dishes", async (_req, res) => {
  res.json(await readDishes());
});

router.post("/dishes", authMiddleware, upload.single("image"), async (req, res) => {
  const { name, desc } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });
  const dishes = await readDishes();
  let imageUrl = req.body.imageUrl ?? "";
  if (req.file) {
    const ext = path.extname(req.file.originalname) || ".jpg";
    imageUrl = await uploadFile("dishes", req.file.buffer, ext, req.file.mimetype);
  }
  const dish = { id: randomUUID(), name, desc: desc ?? "", imageUrl };
  dishes.push(dish);
  await writeDishes(dishes);
  res.status(201).json(dish);
});

router.put("/dishes/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const dishes = await readDishes();
  const idx = dishes.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { name, desc } = req.body ?? {};
  let imageUrl = req.body.imageUrl ?? dishes[idx].imageUrl;
  if (req.file) {
    await deleteFile(dishes[idx].imageUrl);
    const ext = path.extname(req.file.originalname) || ".jpg";
    imageUrl = await uploadFile("dishes", req.file.buffer, ext, req.file.mimetype);
  }
  dishes[idx] = { ...dishes[idx], name: name ?? dishes[idx].name, desc: desc ?? dishes[idx].desc, imageUrl };
  await writeDishes(dishes);
  res.json(dishes[idx]);
});

router.delete("/dishes/:id", authMiddleware, async (req, res) => {
  const dishes = await readDishes();
  const idx = dishes.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const removed = dishes.splice(idx, 1)[0];
  if (removed.imageUrl?.startsWith("/api/files/")) {
    await deleteFile(removed.imageUrl);
  }
  await writeDishes(dishes);
  res.json({ success: true });
});

export default router;
