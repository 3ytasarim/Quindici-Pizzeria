import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// In-memory stand-in for the PostgreSQL-backed storage layer
const store = new Map<string, unknown>();
vi.mock("../lib/gcs", () => ({
  readJSON: async (key: string) => (store.has(key) ? structuredClone(store.get(key)) : null),
  writeJSON: async (key: string, data: unknown) => { store.set(key, structuredClone(data)); },
  uploadFile: async () => "/api/files/events/x.jpg",
  deleteFile: async () => {},
}));

import eventsRouter from "./events";

const token = jwt.sign({ sub: "admin" }, process.env.SESSION_SECRET ?? "quindici-admin-secret-2024");
const auth = { Authorization: `Bearer ${token}` };

const app = express();
app.use(express.json());
app.use("/api", eventsRouter);

const ev = (id: string, order: number, active?: boolean) => ({
  id, title: `T-${id}`, description: "", imageUrl: "", pdfUrl: "", order, ...(active === undefined ? {} : { active }),
});

describe("events: active flag + ordering", () => {
  beforeEach(() => {
    store.set("events", [ev("a", 0), ev("b", 1, false), ev("c", 2, true)]);
  });

  it("public /events returns only active events (legacy entries without flag count as active)", async () => {
    const r = await request(app).get("/api/events");
    expect(r.status).toBe(200);
    expect(r.body.map((e: any) => e.id)).toEqual(["a", "c"]);
  });

  it("admin /admin/events returns all events incl. inactive, and requires auth", async () => {
    expect((await request(app).get("/api/admin/events")).status).toBe(401);
    const r = await request(app).get("/api/admin/events").set(auth);
    expect(r.body.map((e: any) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("PATCH active toggles visibility on the public list", async () => {
    const off = await request(app).patch("/api/admin/events/a/active").set(auth).send({ active: false });
    expect(off.status).toBe(200);
    expect(off.body.active).toBe(false);
    expect((await request(app).get("/api/events")).body.map((e: any) => e.id)).toEqual(["c"]);

    await request(app).patch("/api/admin/events/b/active").set(auth).send({ active: true });
    expect((await request(app).get("/api/events")).body.map((e: any) => e.id)).toEqual(["b", "c"]);
  });

  it("PATCH active rejects non-boolean and unknown id", async () => {
    expect((await request(app).patch("/api/admin/events/a/active").set(auth).send({ active: "yes" })).status).toBe(400);
    expect((await request(app).patch("/api/admin/events/zzz/active").set(auth).send({ active: true })).status).toBe(404);
  });

  it("PUT /admin/events/reorder is reachable (not swallowed by /:id) and persists the new order", async () => {
    const r = await request(app).put("/api/admin/events/reorder").set(auth).send({ ids: ["c", "a", "b"] });
    expect(r.status).toBe(200);
    expect(r.body.map((e: any) => e.id)).toEqual(["c", "a", "b"]);
    expect(r.body.map((e: any) => e.order)).toEqual([0, 1, 2]);
    // public list follows the new order, inactive "b" stays hidden
    expect((await request(app).get("/api/events")).body.map((e: any) => e.id)).toEqual(["c", "a"]);
  });

  it("reorder keeps events that are missing from ids instead of dropping them", async () => {
    const r = await request(app).put("/api/admin/events/reorder").set(auth).send({ ids: ["c", "a"] });
    expect(r.body.map((e: any) => e.id)).toEqual(["c", "a", "b"]);
  });
});
