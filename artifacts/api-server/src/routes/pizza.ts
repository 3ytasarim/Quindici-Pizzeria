import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads/pizza");
const DATA_FILE = path.resolve(__dirname, "../uploads/pizza.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const DEFAULTS = [
  { id: "default-1", label: "Margherita",         imageUrl: "/pizza-1.png", isDefault: true },
  { id: "default-2", label: "Diavola",             imageUrl: "/pizza-2.png", isDefault: true },
  { id: "default-3", label: "Quattro Formaggi",    imageUrl: "/pizza-3.png", isDefault: true },
  { id: "default-4", label: "Prosciutto e Rucola", imageUrl: "/pizza-4.png", isDefault: true },
];

function readList() {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (Array.isArray(raw) && raw.length > 0) return raw;
  } catch {}
  // seed defaults on first read
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULTS, null, 2));
  return DEFAULTS;
}
function saveList(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function auth(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.use("/pizza/images", (req, res, next) => {
  const filePath = path.join(UPLOADS_DIR, path.basename(req.path));
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else next();
});

router.get("/pizza", (_req, res) => res.json(readList()));

router.post("/admin/pizza", auth, upload.single("image"), (req, res) => {
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = imageUrl ?? "";
  if (req.file) finalUrl = `/api/pizza/images/${req.file.filename}`;
  if (!finalUrl) return res.status(400).json({ error: "Bild erforderlich" });
  const list = readList();
  const item = { id: randomUUID(), label: label ?? "", imageUrl: finalUrl, isDefault: false, createdAt: new Date().toISOString() };
  list.push(item);
  saveList(list);
  res.status(201).json(item);
});

router.put("/admin/pizza/:id", auth, upload.single("image"), (req, res) => {
  const list = readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = list[idx].imageUrl;
  if (req.file) {
    // only delete non-default uploaded files
    if (!list[idx].isDefault) {
      const old = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }
    finalUrl = `/api/pizza/images/${req.file.filename}`;
  } else if (imageUrl) finalUrl = imageUrl;
  list[idx] = { ...list[idx], label: label ?? list[idx].label, imageUrl: finalUrl, isDefault: false };
  saveList(list);
  res.json(list[idx]);
});

router.delete("/admin/pizza/:id", auth, (req, res) => {
  const list = readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  if (!list[idx].isDefault) {
    const file = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  list.splice(idx, 1);
  saveList(list);
  res.json({ success: true });
});

// reorder: move item up or down
router.patch("/admin/pizza/:id/move", auth, (req, res) => {
  const { direction } = req.body ?? {};
  const list = readList();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  if (direction === "up" && idx > 0) {
    [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
  } else if (direction === "down" && idx < list.length - 1) {
    [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
  }
  saveList(list);
  res.json(list);
});

export default router;
