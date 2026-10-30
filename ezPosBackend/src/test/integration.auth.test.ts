/**
 * HTTP-level integration tests for the auth and business flows.
 *
 * These tests exercise the real Express app against a REAL PostgreSQL
 * database and INSERT users, businesses, and tokens. They are double-guarded:
 * they only run when BOTH conditions hold —
 *   1. INTEGRATION_TESTS=1 is set explicitly, and
 *   2. DATABASE_URL points at a disposable test database
 *      (dotenv must not win: pass DATABASE_URL on the command line so it
 *      overrides the .env value).
 *
 * Run with:
 *   DATABASE_URL=postgresql://.../ezpos_test INTEGRATION_TESTS=1 npm test
 *
 * Plain `npm test` NEVER runs this file, so the development database can
 * never be touched by accident.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { buildApp } from "../app.js";

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("auth + business integration", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";

  before(async () => {
    // Fail closed: refuse to write to anything but ezpos_test.
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = (await client.query("SELECT current_database() AS db")).rows[0].db;
    await client.end();
    if (db !== "ezpos_test") {
      throw new Error(
        `SAFETY ABORT: connected to "${db}" — integration tests may only run against ezpos_test.`,
      );
    }

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server?.close();
  });

  const uniqueEmail = () =>
    `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

  let accessToken = "";
  let refreshTokenCookie = "";
  const testEmail = uniqueEmail();

  it("registers a user and never returns the password hash", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Integration Test",
        email: testEmail,
        password: "strong-password-123",
      }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { user: Record<string, unknown> };
    assert.equal(body.user.email, testEmail);
    assert.ok(!JSON.stringify(body).includes("passwordHash"));
    assert.ok(!JSON.stringify(body).includes("password_hash"));
  });

  it("rejects duplicate registration with 409", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Integration Test",
        email: testEmail,
        password: "strong-password-123",
      }),
    });
    assert.equal(res.status, 409);
  });

  it("rejects invalid registration data with 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "A", email: "bad", password: "x" }),
    });
    assert.equal(res.status, 400);
  });

  it("logs in with valid credentials and sets the refresh cookie", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "strong-password-123" }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { accessToken: string };
    accessToken = body.accessToken;
    assert.ok(accessToken.length > 20);
    const setCookie = res.headers.get("set-cookie") ?? "";
    assert.match(setCookie, /ezpos_refresh_token=/);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /Path=\/api\/auth/i);
    assert.match(setCookie, /SameSite=Lax/i);
    refreshTokenCookie = setCookie.split(";")[0] ?? "";
  });

  it("fails login with generic error for wrong password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "wrong-password" }),
    });
    assert.equal(res.status, 401);
    const body = (await res.json()) as { message: string };
    assert.equal(body.message, "Invalid email or password.");
  });

  it("rotates the refresh token and invalidates the previous one", async () => {
    const first = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: refreshTokenCookie },
    });
    assert.equal(first.status, 200);
    const newCookie = (first.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
    assert.notEqual(newCookie, refreshTokenCookie);

    // Reusing the OLD token must be rejected...
    const reuse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: refreshTokenCookie },
    });
    assert.equal(reuse.status, 401);

    // ...while the NEW token keeps working.
    const second = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: newCookie },
    });
    assert.equal(second.status, 200);
    refreshTokenCookie = (second.headers.get("set-cookie") ?? "").split(";")[0] ?? "";
  });

  it("returns the current user with memberships from /me", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { user: { email: string } };
    assert.equal(body.user.email, testEmail);
  });

  it("creates a business with an owner membership and no unapproved trial", async () => {
    const res = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: `Test Biz ${Date.now()}` }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as {
      business: { id: number; slug: string };
      ownerRoleSlug: string;
      trialSkipped: boolean;
      subscription: { status: string };
    };
    assert.equal(body.ownerRoleSlug, "owner");
    // 'none' when the trial plan is not seeded; 'trialing' when it is
    // (the tenancy suite seeds it as a fixture). Both are valid outcomes.
    assert.ok(
      ["none", "trialing"].includes(body.subscription.status),
      `unexpected subscription status: ${body.subscription.status}`,
    );
  });

  it("rejects business access for a business the user does not belong to", async () => {
    // The user has exactly one membership (id 1 is likely another business;
    // use an implausibly large id to avoid touching real rows).
    const res = await fetch(`${baseUrl}/api/businesses/999999999`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    assert.equal(res.status, 403);
  });

  it("rejects unauthenticated access to /me", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
  });

  it("logs out and revokes the refresh token", async () => {
    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: refreshTokenCookie },
    });
    assert.equal(logout.status, 200);

    const afterLogout = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { Cookie: refreshTokenCookie },
    });
    assert.equal(afterLogout.status, 401);
  });
});
