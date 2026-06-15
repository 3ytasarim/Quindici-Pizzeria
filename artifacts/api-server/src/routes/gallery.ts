import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../uploads/gallery");
const DATA_FILE = path.resolve(__dirname, "../uploads/gallery.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

function readGallery() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
  catch { return []; }
}
function writeGallery(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

// Serve uploaded images
router.use("/gallery/images", (req, res, next) => {
  const filePath = path.join(UPLOADS_DIR, path.basename(req.path));
  if (fs.existsSync(filePath)) res.sendFile(filePath);
  else next();
});

// Public — list
router.get("/gallery", (_req, res) => {
  res.json(readGallery());
});

// Admin — add
router.post("/admin/gallery", authMiddleware, upload.single("image"), (req, res) => {
  const { title, imageUrl } = req.body ?? {};
  const list = readGallery();
  let finalUrl = imageUrl ?? "";
  if (req.file) finalUrl = `/api/gallery/images/${req.file.filename}`;
  if (!finalUrl) return res.status(400).json({ error: "Bild erforderlich" });
  const item = { id: randomUUID(), title: title ?? "", imageUrl: finalUrl, createdAt: new Date().toISOString() };
  list.push(item);
  writeGallery(list);
  res.status(201).json(item);
});

// Admin — update
router.put("/admin/gallery/:id", authMiddleware, upload.single("image"), (req, res) => {
  const list = readGallery();
  const idx = list.findIndex((g: any) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const { title, imageUrl } = req.body ?? {};
  let finalUrl = list[idx].imageUrl;
  if (req.file) {
    const oldPath = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    finalUrl = `/api/gallery/images/${req.file.filename}`;
  } else if (imageUrl) {
    finalUrl = imageUrl;
  }
  list[idx] = { ...list[idx], title: title ?? list[idx].title, imageUrl: finalUrl };
  writeGallery(list);
  res.json(list[idx]);
});

// Admin — delete
router.delete("/admin/gallery/:id", authMiddleware, (req, res) => {
  const list = readGallery();
  const idx = list.findIndex((g: any) => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  const filePath = path.join(UPLOADS_DIR, path.basename(list[idx].imageUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  list.splice(idx, 1);
  writeGallery(list);
  res.json({ success: true });
});

export default router;
