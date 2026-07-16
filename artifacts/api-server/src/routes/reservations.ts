import { Router } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { db, reservationsTable, wartelisteTable } from "@workspace/db";
import { eq, desc, and, ne } from "drizzle-orm";
import {
  sendReservationConfirmationToGuest,
  sendReservationNotificationToRestaurant,
  sendReservationStatusUpdateToGuest,
} from "../lib/email.js";

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Nicht autorisiert" });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Token ungültig" }); }
}

/** Convert a DB row to the shape the clients expect (camelCase, ISO string dates) */
function toReservationDto(row: typeof reservationsTable.$inferSelect) {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    time: row.time,
    guests: row.guests,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    seen: row.seen,
    status: row.status,
  };
}

function toWartelisteDto(row: typeof wartelisteTable.$inferSelect) {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    guests: row.guests,
    firstName: row.firstName,
    lastName: row.lastName,
    phone: row.phone,
    email: row.email,
    notifType: row.notifType,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    seen: row.seen,
  };
}

/** Maximum number of reservations per time slot before it's considered full */
const SLOT_CAPACITY = 4;

/** All time slots the restaurant offers */
const ALL_TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30',
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
];

const router = Router();

/* ─── RESERVATIONS ─── */

/** GET /reservations/availability?date=DD.MM.YYYY */
router.get("/reservations/availability", async (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== "string")
    return res.status(400).json({ error: "Query-Parameter 'date' fehlt" });

  try {
    // Count confirmed (non-storniert) reservations per time slot for the given date
    const rows = await db
      .select({ time: reservationsTable.time })
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.date, date),
          ne(reservationsTable.status, "storniert")
        )
      );

    const countBySlot: Record<string, number> = {};
    for (const row of rows) {
      countBySlot[row.time] = (countBySlot[row.time] ?? 0) + 1;
    }

    const slots = ALL_TIME_SLOTS.map((time) => ({
      time,
      available: (countBySlot[time] ?? 0) < SLOT_CAPACITY,
      count: countBySlot[time] ?? 0,
    }));

    res.json({ date, slots });
  } catch (err) {
    console.error("Failed to fetch availability:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.post("/reservations", async (req, res) => {
  const { date, time, guests, firstName, lastName, phone, email, notes } = req.body ?? {};
  if (!date || !time || !guests || !firstName || !lastName || !phone || !email)
    return res.status(400).json({ error: "Pflichtfelder fehlen" });

  const entry = {
    id: randomUUID(),
    type: "reservation" as const,
    date,
    time,
    guests,
    firstName,
    lastName,
    phone,
    email: (email as string).toLowerCase().trim(),
    notes: notes ?? "",
    seen: false,
    status: "neu",
  };

  try {
    await db.insert(reservationsTable).values(entry);
    res.status(201).json({ success: true, id: entry.id });

    // Send emails asynchronously — don't block the response
    const fullEntry = { ...entry, createdAt: new Date().toISOString() };
    sendReservationConfirmationToGuest(fullEntry).catch(() => {});
    sendReservationNotificationToRestaurant(fullEntry).catch(() => {});
  } catch (err) {
    console.error("Failed to create reservation:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

/** GET /reservations/lookup?email=... — guest-facing, no auth required */
router.get("/reservations/lookup", async (req, res) => {
  const { email } = req.query;
  if (!email || typeof email !== "string")
    return res.status(400).json({ error: "Query-Parameter 'email' fehlt" });

  try {
    const rows = await db
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.email, email.toLowerCase().trim()))
      .orderBy(desc(reservationsTable.createdAt));

    // Return only the fields guests need — no internal admin fields
    const reservations = rows.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      guests: r.guests,
      firstName: r.firstName,
      lastName: r.lastName,
      status: r.status,
      notes: r.notes,
    }));

    res.json({ reservations });
  } catch (err) {
    console.error("Failed to lookup reservations:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

/** DELETE /reservations/:id/cancel — guest self-service cancellation, verified by email */
router.delete("/reservations/:id/cancel", async (req, res) => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string")
    return res.status(400).json({ error: "E-Mail fehlt" });

  try {
    const existing = await db
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, req.params.id))
      .limit(1);

    if (existing.length === 0)
      return res.status(404).json({ error: "Reservierung nicht gefunden" });

    const reservation = existing[0];

    // Verify the email matches — prevents guests from cancelling other guests' reservations
    if (reservation.email.toLowerCase() !== (email as string).toLowerCase().trim())
      return res.status(403).json({ error: "E-Mail stimmt nicht überein" });

    if (reservation.status === "storniert")
      return res.status(400).json({ error: "Reservierung ist bereits storniert" });

    const [updated] = await db
      .update(reservationsTable)
      .set({ status: "storniert" })
      .where(eq(reservationsTable.id, req.params.id))
      .returning();

    res.json({ success: true });

    // Send status-update email asynchronously
    if (updated.email) {
      sendReservationStatusUpdateToGuest(toReservationDto(updated), "storniert").catch(() => {});
    }
  } catch (err) {
    console.error("Failed to cancel reservation:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.get("/admin/reservations", authMiddleware, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(reservationsTable)
      .orderBy(desc(reservationsTable.createdAt));
    res.json(rows.map(toReservationDto));
  } catch (err) {
    console.error("Failed to fetch reservations:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.patch("/admin/reservations/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await db
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, req.params.id))
      .limit(1);

    if (existing.length === 0)
      return res.status(404).json({ error: "Nicht gefunden" });

    const previousStatus = existing[0].status;

    // Only allow safe fields to be updated
    const { date, time, guests, firstName, lastName, phone, email, notes, seen, status } = req.body ?? {};
    const updates: Partial<typeof reservationsTable.$inferInsert> = {};
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (guests !== undefined) updates.guests = guests;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (notes !== undefined) updates.notes = notes;
    if (seen !== undefined) updates.seen = seen;
    if (status !== undefined) updates.status = status;

    const [updated] = await db
      .update(reservationsTable)
      .set(updates)
      .where(eq(reservationsTable.id, req.params.id))
      .returning();

    res.json(toReservationDto(updated));

    // Notify guest when status changes
    if (updates.status && updates.status !== previousStatus && updated.email) {
      sendReservationStatusUpdateToGuest(toReservationDto(updated), updates.status).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to update reservation:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.delete("/admin/reservations/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db
      .delete(reservationsTable)
      .where(eq(reservationsTable.id, req.params.id))
      .returning({ id: reservationsTable.id });

    if (result.length === 0)
      return res.status(404).json({ error: "Nicht gefunden" });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete reservation:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

/* ─── WARTELISTE ─── */

router.post("/warteliste", async (req, res) => {
  const { date, startTime, endTime, guests, firstName, lastName, phone, email, notifType } = req.body ?? {};
  if (!date || !startTime || !email)
    return res.status(400).json({ error: "Pflichtfelder fehlen" });

  const entry = {
    id: randomUUID(),
    type: "warteliste" as const,
    date,
    startTime,
    endTime: endTime ?? startTime,
    guests: guests ?? "2",
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    phone: phone ?? "",
    email,
    notifType: notifType ?? "email",
    seen: false,
  };

  try {
    await db.insert(wartelisteTable).values(entry);
    res.status(201).json({ success: true, id: entry.id });
  } catch (err) {
    console.error("Failed to create warteliste entry:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.get("/admin/warteliste", authMiddleware, async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(wartelisteTable)
      .orderBy(desc(wartelisteTable.createdAt));
    res.json(rows.map(toWartelisteDto));
  } catch (err) {
    console.error("Failed to fetch warteliste:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.patch("/admin/warteliste/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await db
      .select()
      .from(wartelisteTable)
      .where(eq(wartelisteTable.id, req.params.id))
      .limit(1);

    if (existing.length === 0)
      return res.status(404).json({ error: "Nicht gefunden" });

    const { date, startTime, endTime, guests, firstName, lastName, phone, email, notifType, seen } = req.body ?? {};
    const updates: Partial<typeof wartelisteTable.$inferInsert> = {};
    if (date !== undefined) updates.date = date;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (guests !== undefined) updates.guests = guests;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (notifType !== undefined) updates.notifType = notifType;
    if (seen !== undefined) updates.seen = seen;

    const [updated] = await db
      .update(wartelisteTable)
      .set(updates)
      .where(eq(wartelisteTable.id, req.params.id))
      .returning();

    res.json(toWartelisteDto(updated));
  } catch (err) {
    console.error("Failed to update warteliste entry:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

router.delete("/admin/warteliste/:id", authMiddleware, async (req, res) => {
  try {
    const result = await db
      .delete(wartelisteTable)
      .where(eq(wartelisteTable.id, req.params.id))
      .returning({ id: wartelisteTable.id });

    if (result.length === 0)
      return res.status(404).json({ error: "Nicht gefunden" });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete warteliste entry:", err);
    res.status(500).json({ error: "Interner Fehler" });
  }
});

export default router;
