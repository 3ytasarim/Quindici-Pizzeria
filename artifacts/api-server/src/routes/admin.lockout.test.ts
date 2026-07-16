/**
 * Admin login lockout — edge-case tests
 *
 * Tests use distinct IP addresses (via X-Forwarded-For) so each scenario
 * starts with a clean slate without needing to touch module internals beyond
 * the explicit _clearAllFailedAttempts() helper.
 *
 * Fake timers let us jump the clock without sleeping.
 *
 * How the lockout works:
 *   checkRateLimit() → recordFailure() / resetFailures()
 * The 5th bad attempt records the failure and sets lockedUntil, but that
 * attempt itself still returns 401.  The *6th* attempt (or any attempt
 * while locked) returns 429 + Retry-After.
 *
 * Env vars (credentials, window sizes) are injected via vitest.config.ts
 * `test.env` so they are present before module-level constants are captured.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";

import app from "../app.js";
import { _clearAllFailedAttempts } from "./admin.js";

const GOOD = { username: "testadmin", password: "testpass123" };
const BAD  = { username: "testadmin", password: "wrong" };

/** Fire `n` bad login requests from a given IP, discarding the responses. */
async function failN(n: number, ip: string) {
  for (let i = 0; i < n; i++) {
    await request(app)
      .post("/api/admin/login")
      .set("X-Forwarded-For", ip)
      .send(BAD);
  }
}

/** Return the response of one more bad attempt from `ip`. */
async function oneBad(ip: string) {
  return request(app)
    .post("/api/admin/login")
    .set("X-Forwarded-For", ip)
    .send(BAD);
}

/** Return the response of one good-credentials attempt from `ip`. */
async function oneGood(ip: string) {
  return request(app)
    .post("/api/admin/login")
    .set("X-Forwarded-For", ip)
    .send(GOOD);
}

beforeEach(() => {
  _clearAllFailedAttempts();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// 1. Five failed attempts within the window trigger 429 + Retry-After header
//
// The 5th bad attempt sets lockedUntil (returns 401 itself because
// checkRateLimit() runs before recordFailure()).  The 6th attempt is the
// first one blocked.
// ---------------------------------------------------------------------------
describe("lockout triggers after MAX_ATTEMPTS failures", () => {
  it("returns 429 with Retry-After header once the IP is locked", async () => {
    const ip = "10.0.0.1";

    // 5 failures saturate the counter and arm the lockout
    await failN(5, ip);

    // 6th attempt — should now be blocked
    const res = await oneBad(ip);

    expect(res.status).toBe(429);
    expect(res.headers).toHaveProperty("retry-after");
    const retryAfter = Number(res.headers["retry-after"]);
    expect(retryAfter).toBeGreaterThan(0);
  });

  it("keeps returning 429 for every subsequent attempt while locked", async () => {
    const ip = "10.0.0.2";

    await failN(5, ip);

    // Even correct credentials are rejected during lockout
    const res = await oneGood(ip);

    expect(res.status).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// 2. Successful login resets the counter → next failure cycle starts fresh
// ---------------------------------------------------------------------------
describe("successful login resets the failure counter", () => {
  it("allows a full new MAX_ATTEMPTS cycle after a successful login", async () => {
    const ip = "10.0.1.1";

    // Accumulate 4 failures (one below the lock threshold)
    await failN(4, ip);

    // Log in successfully — counter must be cleared
    const loginRes = await oneGood(ip);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("token");

    // 4 bad attempts in the fresh cycle should all return 401, not 429
    for (let i = 0; i < 4; i++) {
      const r = await oneBad(ip);
      expect(r.status).toBe(401);
    }

    // The 5th failure in this new cycle arms the lockout ...
    await oneBad(ip); // → 401, sets lockedUntil
    // ... and the 6th is blocked
    const blocked = await oneBad(ip);
    expect(blocked.status).toBe(429);
  });

  it("counts a new full window — not just residual attempts — after reset", async () => {
    const ip = "10.0.1.2";

    // Lock out the IP once
    await failN(5, ip);

    // Advance past the lockout so we can log in
    vi.advanceTimersByTime(31_000);

    // Log in successfully
    const loginRes = await oneGood(ip);
    expect(loginRes.status).toBe(200);

    // After reset, should tolerate MAX_ATTEMPTS-1 failures without a lockout
    for (let i = 0; i < 4; i++) {
      const r = await oneBad(ip);
      expect(r.status).toBe(401);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. After the lockout duration passes, the endpoint accepts attempts again
// ---------------------------------------------------------------------------
describe("lockout expires after the lockout duration", () => {
  it("accepts a correct login after the lockout window elapses", async () => {
    const ip = "10.0.2.1";

    await failN(5, ip);

    // Confirm we are locked
    expect((await oneBad(ip)).status).toBe(429);

    // Advance clock past the 30 s lockout
    vi.advanceTimersByTime(31_000);

    // Should now be unlocked
    const unlocked = await oneGood(ip);
    expect(unlocked.status).toBe(200);
    expect(unlocked.body).toHaveProperty("token");
  });

  it("does NOT unlock before the lockout duration has elapsed", async () => {
    const ip = "10.0.2.2";

    await failN(5, ip);

    // Advance only halfway through the 30 s lockout
    vi.advanceTimersByTime(15_000);

    expect((await oneGood(ip)).status).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// 4. Failures from different IPs are completely isolated
// ---------------------------------------------------------------------------
describe("rate-limit state is isolated per IP", () => {
  it("does not lock out a clean IP when another IP is locked", async () => {
    const lockedIp = "10.0.3.1";
    const cleanIp  = "10.0.3.2";

    // Lock out the first IP
    await failN(5, lockedIp);
    expect((await oneBad(lockedIp)).status).toBe(429);

    // The second IP should still be able to log in successfully
    const res = await oneGood(cleanIp);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("counts failures independently per IP — neither bleeds into the other", async () => {
    const ipA = "10.0.3.3";
    const ipB = "10.0.3.4";

    // 4 failures from each IP — neither should be locked yet
    await failN(4, ipA);
    await failN(4, ipB);

    // Both are still getting 401, not 429
    expect((await oneBad(ipA)).status).toBe(401); // 5th → arms lockout
    expect((await oneBad(ipB)).status).toBe(401); // 5th → arms lockout independently

    // Now both are locked — 6th attempt from each is blocked
    expect((await oneBad(ipA)).status).toBe(429);
    expect((await oneBad(ipB)).status).toBe(429);
  });
});
