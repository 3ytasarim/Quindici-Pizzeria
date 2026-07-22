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
import jwt from "jsonwebtoken";

import app from "../app.js";
import { reservationsTable, wartelisteTable } from "@workspace/db";

// ---------------------------------------------------------------------------
// Admin auth token (uses the same default secret as the production code)
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.SESSION_SECRET ?? "quindici-admin-secret-2024";
const ADMIN_TOKEN = jwt.sign({ sub: "admin" }, JWT_SECRET, { expiresIn: "1h" });

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

describe("PATCH /api/admin/warteliste/:id — admin update persists to PostgreSQL", () => {
  it("marks a warteliste entry as seen and the change survives a reconnect", async () => {
    // Step 1 — create
    const createRes = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "patch-seen@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    createdWartelisteIds.push(id);

    // Step 2 — mark as seen via admin PATCH
    const patchRes = await request(app)
      .patch(`/api/admin/warteliste/${id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ seen: true });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.seen).toBe(true);

    // Step 3 — verify via fresh DB connection
    const { db: freshDb, pool: freshPool } = createFreshDb();
    try {
      const rows = await freshDb
        .select()
        .from(wartelisteTable)
        .where(eq(wartelisteTable.id, id));

      expect(rows).toHaveLength(1);
      expect(rows[0].seen).toBe(true);
    } finally {
      await freshPool.end();
    }
  });

  it("updates guest details and the change survives a reconnect", async () => {
    // Step 1 — create
    const createRes = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "patch-details@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    createdWartelisteIds.push(id);

    // Step 2 — update phone via admin PATCH
    const patchRes = await request(app)
      .patch(`/api/admin/warteliste/${id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({ phone: "+49 999 9999999", guests: "4" });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.phone).toBe("+49 999 9999999");
    expect(patchRes.body.guests).toBe("4");

    // Step 3 — verify via fresh DB connection
    const { db: freshDb, pool: freshPool } = createFreshDb();
    try {
      const rows = await freshDb
        .select()
        .from(wartelisteTable)
        .where(eq(wartelisteTable.id, id));

      expect(rows).toHaveLength(1);
      expect(rows[0].phone).toBe("+49 999 9999999");
      expect(rows[0].guests).toBe("4");
    } finally {
      await freshPool.end();
    }
  });

  it("ignores disallowed fields — id, type, and createdAt cannot be overwritten", async () => {
    // Step 1 — create
    const createRes = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "patch-allowlist@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    createdWartelisteIds.push(id);

    // Step 2 — attempt to overwrite protected fields
    const patchRes = await request(app)
      .patch(`/api/admin/warteliste/${id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`)
      .send({
        id: "00000000-0000-0000-0000-000000000000",
        type: "reservation",
        createdAt: "1970-01-01T00:00:00.000Z",
        seen: true, // the one allowed field to confirm the request went through
      });

    expect(patchRes.status).toBe(200);
    // The allowed field was applied
    expect(patchRes.body.seen).toBe(true);
    // The protected fields were not changed
    expect(patchRes.body.id).toBe(id);

    // Step 3 — verify via fresh DB connection that id is unchanged
    const { db: freshDb, pool: freshPool } = createFreshDb();
    try {
      const rows = await freshDb
        .select()
        .from(wartelisteTable)
        .where(eq(wartelisteTable.id, id));

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe(id);
      expect(rows[0].type).toBe("warteliste");
    } finally {
      await freshPool.end();
    }
  });

  it("returns 401 when called without a valid token", async () => {
    const res = await request(app)
      .patch("/api/admin/warteliste/nonexistent-id")
      .send({ seen: true });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/admin/warteliste/:id — deletion is permanent in PostgreSQL", () => {
  it("removes the row from the database and it cannot be found via a fresh connection", async () => {
    // Step 1 — create
    const createRes = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "delete-persist@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    // Do NOT push to createdWartelisteIds — the test deletes it itself

    // Step 2 — delete via admin API
    const deleteRes = await request(app)
      .delete(`/api/admin/warteliste/${id}`)
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Step 3 — verify deletion via fresh DB connection
    const { db: freshDb, pool: freshPool } = createFreshDb();
    try {
      const rows = await freshDb
        .select()
        .from(wartelisteTable)
        .where(eq(wartelisteTable.id, id));

      expect(rows).toHaveLength(0);
    } finally {
      await freshPool.end();
    }
  });

  it("returns 404 when deleting a non-existent entry", async () => {
    const res = await request(app)
      .delete("/api/admin/warteliste/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`);

    expect(res.status).toBe(404);
  });

  it("returns 401 when called without a valid token", async () => {
    const res = await request(app)
      .delete("/api/admin/warteliste/nonexistent-id");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/admin/warteliste — list returns all entries from PostgreSQL", () => {
  it("returns newly created entries and requires auth", async () => {
    // Step 1 — confirm unauthenticated access is rejected
    const unauthRes = await request(app).get("/api/admin/warteliste");
    expect(unauthRes.status).toBe(401);

    // Step 2 — create an entry
    const createRes = await request(app)
      .post("/api/warteliste")
      .send({ ...WARTELISTE_PAYLOAD, email: "list-test@example.com" });

    expect(createRes.status).toBe(201);
    const id: string = createRes.body.id;
    createdWartelisteIds.push(id);

    // Step 3 — fetch the admin list and confirm the entry appears
    const listRes = await request(app)
      .get("/api/admin/warteliste")
      .set("Authorization", `Bearer ${ADMIN_TOKEN}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);

    const found = listRes.body.find((e: { id: string }) => e.id === id);
    expect(found).toBeDefined();
    expect(found.email).toBe("list-test@example.com");
    expect(found.seen).toBe(false);
  });
});
