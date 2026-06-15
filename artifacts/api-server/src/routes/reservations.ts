import { Router } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RES_FILE = path.resolve(__dirname, "../uploads/reservations.json");
const WARTE_FILE = path.resolve(__dirname, "../uploads/warteliste.json");
const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

function readFile(file: string) {
  try { return JSON.parse(fs.readFileSync(file, "utf-8")); }
  catch { return []; }
}
function writeFile(file: string, data: any[]) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const router = Router();

/* ─── RESERVATIONS ─── */

router.post("/reservations", (req, res) => {
  const { date, time, guests, firstName, lastName, phone, email, notes } = req.body ?? {};
  if (!date || !time || !guests || !firstName || !lastName || !phone || !email)
    return res.status(400).json({ error: "Pflichtfelder fehlen" });
  const list = readFile(RES_FILE);
  const entry = {
    id: randomUUID(), type: "reservation",
    date, time, guests, firstName, lastName, phone, email,
    notes: notes ?? "", createdAt: new Date().toISOString(),
    seen: false, status: "neu" as const,
  };
  list.unshift(entry);
  writeFile(RES_FILE, list);
  res.status(201).json({ success: true, id: entry.id });
});

router.get("/admin/reservations", authMiddleware, (_req, res) => {
  res.json(readFile(RES_FILE));
});

router.patch("/admin/reservations/:id", authMiddleware, (req, res) => {
  const list = readFile(RES_FILE);
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list[idx] = { ...list[idx], ...req.body };
  writeFile(RES_FILE, list);
  res.json(list[idx]);
});

router.delete("/admin/reservations/:id", authMiddleware, (req, res) => {
  const list = readFile(RES_FILE);
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list.splice(idx, 1);
  writeFile(RES_FILE, list);
  res.json({ success: true });
});

/* ─── WARTELISTE ─── */

router.post("/warteliste", (req, res) => {
  const { date, startTime, endTime, guests, firstName, lastName, phone, email, notifType } = req.body ?? {};
  if (!date || !startTime || !email)
    return res.status(400).json({ error: "Pflichtfelder fehlen" });
  const list = readFile(WARTE_FILE);
  const entry = {
    id: randomUUID(), type: "warteliste",
    date, startTime, endTime: endTime ?? startTime,
    guests: guests ?? "2",
    firstName: firstName ?? "", lastName: lastName ?? "",
    phone: phone ?? "", email,
    notifType: notifType ?? "email",
    createdAt: new Date().toISOString(),
    seen: false,
  };
  list.unshift(entry);
  writeFile(WARTE_FILE, list);
  res.status(201).json({ success: true, id: entry.id });
});

router.get("/admin/warteliste", authMiddleware, (_req, res) => {
  res.json(readFile(WARTE_FILE));
});

router.patch("/admin/warteliste/:id", authMiddleware, (req, res) => {
  const list = readFile(WARTE_FILE);
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list[idx] = { ...list[idx], ...req.body };
  writeFile(WARTE_FILE, list);
  res.json(list[idx]);
});

router.delete("/admin/warteliste/:id", authMiddleware, (req, res) => {
  const list = readFile(WARTE_FILE);
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Nicht gefunden" });
  list.splice(idx, 1);
  writeFile(WARTE_FILE, list);
  res.json({ success: true });
});

export default router;
