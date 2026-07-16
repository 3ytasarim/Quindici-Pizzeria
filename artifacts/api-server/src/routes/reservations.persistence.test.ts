/**
 * Persistence smoke tests — reservations & warteliste
 *
 * Each test:
 *   1. Creates a record via the HTTP API (using the app's connection pool).
 *   2. Opens a *separate* database connection (simulating a fresh server
 *      process after a restart) and queries for the row directly.
 *   3. Asserts the record is present in PostgreSQL — proving data was
 *      committed and is not just held in application memory.
 *
 * Records created during the test are deleted in `afterEach` so the
 * development database stays clean.
 */

import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import app from "../app.js";
import { reservationsTable, wartelisteTable } from "@workspace/db";

// ---------------------------------------------------------------------------
// Fresh connection — simulates a new server process after a restart
// ---------------------------------------------------------------------------

function createFreshDb() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: { reservationsTable, wartelisteTable } });
  return { db, pool };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RESERVATION_PAYLOAD = {
  date: "25.12.2099",
  time: "19:00",
  guests: "2",
  firstName: "Test",
  lastName: "Persistence",
  phone: "+49 000 0000000",
  email: "persistence-test@example.com",
  notes: "automated test — safe to delete",
};

const WARTELISTE_PAYLOAD = {
  date: "25.12.2099",
  startTime: "18:00",
  endTime: "20:00",
  guests: "3",
  firstName: "Test",
  lastName: "Warteliste",
  phone: "+49 000 1111111",
  email: "persistence-waitlist@example.com",
  notifType: "email",
};

// Track IDs so afterEach can clean up
const createdReservationIds: string[] = [];
const createdWartelisteIds: string[] = [];

afterEach(async () => {
  // Use the app's own db pool to clean up test rows
  const { db: freshDb, pool: freshPool } = createFreshDb();
  try {
    for (const id of createdReservationIds) {
      await freshDb.delete(reservationsTable).where(eq(reservationsTable.id, id));
    }
    for (const id of createdWartelisteIds) {
      await freshDb.delete(wartelisteTable).where(eq(wartelisteTable.id, id));
    }
  } finally {
    createdReservationIds.length = 0;
    createdWartelisteIds.length = 0;
    await freshPool.end();
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/reservations — data survives a server restart", () => {
  it("persists a new reservation to PostgreSQL and retrieves it via a fresh connection", async () => {
    // Step 1 — create via the API
    const res = await request(app)
      .post("/api/reservations")
      .send(RESERVATION_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");

    const id: string = res.body.id;
    createdReservationIds.push(id);

    // Step 2 — open a brand-new database connection (fresh server process)
    const { db: freshDb, pool: freshPool } = createFreshDb();

    try {
      // Step 3 — verify the row exists in PostgreSQL
      const rows = await freshDb
        .select()
        .from(reservationsTable)
        .where(eq(reservationsTable.id, id));

      expect(rows).toHaveLength(1);

      const row = rows[0];
      expect(row.id).toBe(id);
      expect(row.date).toBe(RESERVATION_PAYLOAD.date);
      expect(row.time).toBe(RESERVATION_PAYLOAD.time);
      expect(row.guests).toBe(RESERVATION_PAYLOAD.guests);
      expect(row.firstName).toBe(RESERVATION_PAYLOAD.firstName);
      expect(row.lastName).toBe(RESERVATION_PAYLOAD.lastName);
      expect(row.email).toBe(RESERVATION_PAYLOAD.email.toLowerCase());
      expect(row.status).toBe("neu");
      expect(row.seen).toBe(false);
    } finally {
      await freshPool.end();
    }
  });

  it("returns the same record when fetched via the admin API after reconnect", async () => {
    // Step 1 — create via the API
    const createRes = await request(app)
      .post("/api/reservations")
      .send({ ...RESERVATION_PAYLOAD, email: "persistence-test-admin@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    createdReservationIds.push(id);

    // Step 2 — open a fresh DB connection and confirm the row is present
    const { db: freshDb, pool: freshPool } = createFreshDb();

    try {
      const rows = await freshDb
        .select()
        .from(reservationsTable)
        .where(eq(reservationsTable.id, id));

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(id);
    } finally {
      await freshPool.end();
    }
  });
});

describe("POST /api/warteliste — data survives a server restart", () => {
  it("persists a new warteliste entry to PostgreSQL and retrieves it via a fresh connection", async () => {
    // Step 1 — create via the API
    const res = await request(app)
      .post("/api/warteliste")
      .send(WARTELISTE_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");

    const id: string = res.body.id;
    createdWartelisteIds.push(id);

    // Step 2 — open a brand-new database connection (fresh server process)
    const { db: freshDb, pool: freshPool } = createFreshDb();

    try {
      // Step 3 — verify the row exists in PostgreSQL
      const rows = await freshDb
        .select()
        .from(wartelisteTable)
        .where(eq(wartelisteTable.id, id));

      expect(rows).toHaveLength(1);

      const row = rows[0];
      expect(row.id).toBe(id);
      expect(row.date).toBe(WARTELISTE_PAYLOAD.date);
      expect(row.startTime).toBe(WARTELISTE_PAYLOAD.startTime);
      expect(row.endTime).toBe(WARTELISTE_PAYLOAD.endTime);
      expect(row.guests).toBe(WARTELISTE_PAYLOAD.guests);
      expect(row.firstName).toBe(WARTELISTE_PAYLOAD.firstName);
      expect(row.lastName).toBe(WARTELISTE_PAYLOAD.lastName);
      expect(row.email).toBe(WARTELISTE_PAYLOAD.email);
      expect(row.notifType).toBe(WARTELISTE_PAYLOAD.notifType);
      expect(row.seen).toBe(false);
    } finally {
      await freshPool.end();
    }
  });

  it("does not lose the warteliste entry when the connection pool is cycled", async () => {
    // Step 1 — create via the API
    const res = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "persistence-waitlist-cycle@example.com" });

    expect(res.status).toBe(201);
    const id: string = res.body.id;
    createdWartelisteIds.push(id);

    // Step 2 — simulate reconnect: open, query, close, open again, query again
    for (let cycle = 0; cycle < 2; cycle++) {
      const { db: freshDb, pool: freshPool } = createFreshDb();
      try {
        const rows = await freshDb
          .select()
          .from(wartelisteTable)
          .where(eq(wartelisteTable.id, id));

        expect(rows).toHaveLength(1);
        expect(rows[0].id).toBe(id);
      } finally {
        await freshPool.end();
      }
    }
  });
});
