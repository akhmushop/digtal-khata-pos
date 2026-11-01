/**
 * Support / contact endpoint integration tests (Phase 1).
 *
 * The public contact endpoint is unauthenticated by design — these tests
 * verify validation, persistence, and that no auth/business context is
 * required, against a REAL PostgreSQL database. Double-guarded like the
 * other suites: runs ONLY with INTEGRATION_TESTS=1 AND DATABASE_URL
 * pointing at ezpos_test (fail-closed).
 *
 * Plain `npm test` NEVER runs this file.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { buildApp } from "../app.js";
import { ensureRbacSeed } from "../rbac/seed.js";

const runIntegration =
  process.env.INTEGRATION_TESTS === "1" && Boolean(process.env.DATABASE_URL);

describe("support contact integration", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";

  before(async () => {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const db = await client.query("SELECT current_database() AS db");
    if (db.rows[0]?.db !== "ezpos_test") {
      await client.end();
      throw new Error(
        `SAFETY ABORT: connected to "${db.rows[0]?.db}" — integration tests may only run against ezpos_test.`,
      );
    }
    await client.end();

    await ensureRbacSeed();

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server?.close();
  });

  async function queryTickets(email: string) {
    const { default: pg } = await import("pg");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    // A failed query must not leak the connection — an open socket keeps the
    // test process's event loop alive and the suite never exits.
    try {
      await client.connect();
      const result = await client.query(
        `SELECT id, name, email, phone, subject, message, status, source, business_id, user_id
       FROM support_tickets WHERE email = $1 ORDER BY id DESC`,
        [email],
      );
      return result.rows;
    } finally {
      await client.end();
    }
  }

  it("accepts a valid anonymous contact submission and persists a ticket", async () => {
    const email = `contact-${Date.now()}@example.test`;
    const res = await fetch(`${baseUrl}/api/support/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Shop Owner",
        email,
        subject: "Pricing question",
        message: "Do you have a plan for two outlets?",
      }),
    });
    assert.equal(res.status, 201);
    const body = (await res.json()) as { success?: boolean; data?: { ticketId?: number } };
    assert.equal(body.success, true);
    assert.ok(typeof body.data?.ticketId === "number");

    const tickets = await queryTickets(email);
    assert.equal(tickets.length, 1);
    const ticket = tickets[0] as Record<string, unknown>;
    assert.equal(ticket.name, "Shop Owner");
    assert.equal(ticket.subject, "Pricing question");
    assert.equal(ticket.status, "open");
    assert.equal(ticket.source, "contact");
    assert.equal(ticket.phone, null);
  });

  it("rejects invalid payloads with 400 and stores nothing", async () => {
    const email = `contact-invalid-${Date.now()}@example.test`;
    const res = await fetch(`${baseUrl}/api/support/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "X",
        email,
        subject: "",
        message: "short",
      }),
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { success?: boolean; message?: string };
    assert.equal(body.success, false);
    assert.ok(typeof body.message === "string" && body.message.length > 0);

    const tickets = await queryTickets(email);
    assert.equal(tickets.length, 0);
  });

  it("does not require any auth headers or business context", async () => {
    const email = `contact-noauth-${Date.now()}@example.test`;
    const res = await fetch(`${baseUrl}/api/support/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Anonymous Visitor",
        email,
        phone: "+8801712345678",
        subject: "No auth sent",
        message: "This submission carries no Authorization header at all.",
      }),
    });
    assert.equal(res.status, 201);

    const tickets = await queryTickets(email);
    const ticket = tickets[0] as Record<string, unknown>;
    assert.equal(ticket.phone, "+8801712345678");
    assert.equal(ticket.business_id, null);
    assert.equal(ticket.user_id, null);
  });
});
