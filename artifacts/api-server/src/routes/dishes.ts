import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads/dishes");
const DATA_FILE = path.resolve(__dirname, "../uploads/dishes.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

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

function readDishes() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeDishes(dishes: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dishes, null, 2));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, _file, cb) => {
    const ext = path.extname(_file.originalname) || ".jpg";
    cb(null, `dish-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Nur Bilddateien erlaubt"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get("/dishes", (_req, res) => {
  res.json(readDishes());
});

router.get("/dishes/images/:filename", (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).end();
  res.sendFile(filePath);
});

router.post("/dishes", authMiddleware, upload.single("image"), (req, res) => {
  const { name, desc } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });
  const dishes = readDishes();
  const imageUrl = req.file
    ? `/api/dishes/images/${req.file.filename}`
    : (req.body.imageUrl ?? "");
  const dish = { id: randomUUID(), name, desc: desc ?? "", imageUrl };
  dishes.push(dish);
  writeDishes(dishes);
  res.status(201).json(dish);
});

router.put("/dishes/:id", authMiddleware, upload.single("image"), (req, res) => {
  const dishes = readDishes();
  const idx = dishes.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { name, desc } = req.body ?? {};
  const imageUrl = req.file
    ? `/api/dishes/images/${req.file.filename}`
    : (req.body.imageUrl ?? dishes[idx].imageUrl);
  dishes[idx] = { ...dishes[idx], name: name ?? dishes[idx].name, desc: desc ?? dishes[idx].desc, imageUrl };
  writeDishes(dishes);
  res.json(dishes[idx]);
});

router.delete("/dishes/:id", authMiddleware, (req, res) => {
  const dishes = readDishes();
  const idx = dishes.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const removed = dishes.splice(idx, 1)[0];
  if (removed.imageUrl?.startsWith("/api/dishes/images/")) {
    const fname = removed.imageUrl.split("/").pop();
    const fp = path.join(UPLOADS_DIR, fname);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  writeDishes(dishes);
  res.json({ success: true });
});

export default router;
