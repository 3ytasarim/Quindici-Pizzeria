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

function auth(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

function read() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
  catch { return []; }
}
function save(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
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

router.get("/pizza", (_req, res) => res.json(read()));

router.post("/admin/pizza", auth, upload.single("image"), (req, res) => {
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = imageUrl ?? "";
  if (req.file) finalUrl = `/api/pizza/images/${req.file.filename}`;
  if (!finalUrl) return res.status(400).json({ error: "Bild erforderlich" });
  const list = read();
  const item = { id: randomUUID(), label: label ?? "", imageUrl: finalUrl, createdAt: new Date().toISOString() };
  list.push(item);
  save(list);
  res.status(201).json(item);
});

router.put("/admin/pizza/:id", auth, upload.single("image"), (req, res) => {
  const list = read();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { label, imageUrl } = req.body ?? {};
  let finalUrl = list[idx].imageUrl;
  if (req.file) {
    const old = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
    if (fs.existsSync(old)) fs.unlinkSync(old);
    finalUrl = `/api/pizza/images/${req.file.filename}`;
  } else if (imageUrl) finalUrl = imageUrl;
  list[idx] = { ...list[idx], label: label ?? list[idx].label, imageUrl: finalUrl };
  save(list);
  res.json(list[idx]);
});

router.delete("/admin/pizza/:id", auth, (req, res) => {
  const list = read();
  const idx = list.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const file = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  list.splice(idx, 1);
  save(list);
  res.json({ success: true });
});

export default router;
