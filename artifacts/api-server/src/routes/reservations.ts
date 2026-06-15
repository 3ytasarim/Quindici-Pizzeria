import { Router } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.resolve(__dirname, "../uploads/reservations.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

function read() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); }
  catch { return []; }
}
function write(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const router = Router();

// Public — submit reservation from form
router.post("/reservations", (req, res) => {
  const { date, time, guests, firstName, lastName, phone, email, notes } = req.body ?? {};
  if (!date || !time || !guests || !firstName || !lastName || !phone || !email) {
    return res.status(400).json({ error: "Pflichtfelder fehlen" });
  }
  const list = read();
  const entry = {
    id: randomUUID(),
    date, time, guests, firstName, lastName, phone, email,
    notes: notes ?? "",
    createdAt: new Date().toISOString(),
    seen: false,
    status: "neu" as const,
  };
  list.unshift(entry); // newest first
  write(list);
  res.status(201).json({ success: true, id: entry.id });
});

// Admin — list all
router.get("/admin/reservations", authMiddleware, (_req, res) => {
  res.json(read());
});

// Admin — mark seen / update status
router.patch("/admin/reservations/:id", authMiddleware, (req, res) => {
  const list = read();
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list[idx] = { ...list[idx], ...req.body };
  write(list);
  res.json(list[idx]);
});

// Admin — delete
router.delete("/admin/reservations/:id", authMiddleware, (req, res) => {
  const list = read();
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list.splice(idx, 1);
  write(list);
  res.json({ success: true });
});

export default router;
