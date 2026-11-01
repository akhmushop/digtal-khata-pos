/**
 * Phase 8: consolidated tenant-isolation tests. A second, unrelated
 * business's owner probes every SaaS surface with business A's identifiers —
 * every probe must fail with 403 (no membership) or 404 (indistinguishable
 * from missing), never 200. Against a REAL PostgreSQL database.
 * Double-guarded like the other suites.
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

describe("tenant isolation (consolidated)", { skip: !runIntegration }, () => {
  let server: import("node:http").Server | undefined;
  let baseUrl = "";
  let pg: import("pg").Client | null = null;

  before(async () => {
    const { default: pgDefault } = await import("pg");
    const client = new pgDefault.Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    const db = await client.query("SELECT current_database() AS db");
    if (db.rows[0]?.db !== "ezpos_test") {
      await client.end();
      throw new Error(
        `SAFETY ABORT: connected to "${db.rows[0]?.db}" — integration tests may only run against ezpos_test.`,
      );
    }
    pg = client;
    await ensureRbacSeed();

    const app = buildApp();
    server = app.listen(0);
    const address = server!.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    server?.close();
    await pg?.end();
    pg = null;
  });

  let counter = 0;
  const uniqueEmail = () =>
    `iso-${Date.now()}-${(counter += 1)}@example.test`;

  interface Ctx {
    token: string;
    businessId: number;
    userId: number;
    email: string;
  }

  async function createOwnerCtx(businessName: string): Promise<Ctx> {
    const email = uniqueEmail();
    const reg = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Isolation Test",
        email,
        password: "strong-password-123",
      }),
    });
    assert.equal(reg.status, 201);
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "strong-password-123" }),
    });
    const loginBody = (await login.json()) as {
      accessToken: string;
      user: { id: number };
    };
    const biz = await fetch(`${baseUrl}/api/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginBody.accessToken}`,
      },
      body: JSON.stringify({ name: businessName }),
    });
    assert.equal(biz.status, 201);
    const bizBody = (await biz.json()) as { business: { id: number } };
    return {
      token: loginBody.accessToken,
      businessId: bizBody.business.id,
      userId: loginBody.user.id,
      email,
    };
  }

  /** Foreign member credentials + business A's identifiers. */
  async function foreignGet(
    foreign: Ctx,
    pathOfA: string,
    method = "GET",
    body?: unknown,
  ): Promise<number> {
    const res = await fetch(`${baseUrl}${pathOfA}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${foreign.token}`,
        // The X-Business-Id header points at the FOREIGN business — the
        // path IDs still belong to A. Membership resolution must reject.
        "X-Business-Id": String(foreign.businessId),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return res.status;
  }

  it("invoice detail is invisible to a foreign member", async () => {
    const ownerA = await createOwnerCtx("Iso A");
    const foreign = await createOwnerCtx("Iso Foreign");

    const renew = await fetch(`${baseUrl}/api/businesses/${ownerA.businessId}/subscription/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ownerA.token}`,
        "X-Business-Id": String(ownerA.businessId),
      },
    });
    assert.equal(renew.status, 200);
    const invoices = (await (
      await fetch(`${baseUrl}/api/businesses/${ownerA.businessId}/invoices`, {
        headers: {
          Authorization: `Bearer ${ownerA.token}`,
          "X-Business-Id": String(ownerA.businessId),
        },
      })
    ).json()) as { data: { id: number }[] };
    const invoiceId = invoices.data[0]!.id;

    const status = await foreignGet(
      foreign,
      `/api/businesses/${ownerA.businessId}/invoices/${invoiceId}`,
    );
    assert.ok([403, 404].includes(status), `foreign invoice read returned ${status}`);
  });

  it("subscription actions are membership-gated", async () => {
    const ownerA = await createOwnerCtx("Iso Sub A");
    const foreign = await createOwnerCtx("Iso Sub Foreign");

    const plan = await pg!.query(
      `INSERT INTO subscription_plans (name, slug, interval, price, currency, is_active)
       VALUES ('Iso Plan', $1, 'monthly', 100, 'BDT', true) RETURNING id`,
      [`iso-${Date.now()}`],
    );
    const planId = plan.rows[0]!.id as number;

    const actions: [string, unknown][] = [
      [`/api/businesses/${ownerA.businessId}/subscription/change-plan`, { planId }],
      [`/api/businesses/${ownerA.businessId}/subscription/cancel`, { immediate: true }],
      [`/api/businesses/${ownerA.businessId}/subscription/reactivate`, {}],
      [`/api/businesses/${ownerA.businessId}/subscription/renew`, {}],
    ];
    for (const [path, body] of actions) {
      const status = await foreignGet(foreign, path, "POST", body);
      assert.equal(status, 403, `${path} returned ${status} for a foreign member`);
    }
  });

  it("payment initiation and verification are membership-gated", async () => {
    const ownerA = await createOwnerCtx("Iso Pay A");
    const foreign = await createOwnerCtx("Iso Pay Foreign");

    const invoices = (await (
      await fetch(`${baseUrl}/api/businesses/${ownerA.businessId}/invoices`, {
        headers: {
          Authorization: `Bearer ${ownerA.token}`,
          "X-Business-Id": String(ownerA.businessId),
        },
      })
    ).json()) as { data: { id: number; status: string }[] };
    const pending = invoices.data.find((i) => i.status === "pending");
    if (pending) {
      const initiate = await foreignGet(
        foreign,
        `/api/businesses/${ownerA.businessId}/payments/initiate`,
        "POST",
        { invoiceId: pending.id },
      );
      assert.equal(initiate, 403);
    }

    // Verification with a fabricated payment id is membership-gated too.
    const verify = await foreignGet(
      foreign,
      `/api/businesses/${ownerA.businessId}/payments/999999/verify`,
      "POST",
      { valId: "MOCK-VALID" },
    );
    assert.ok([403, 404].includes(verify), `foreign verify returned ${verify}`);
  });

  it("support tickets from another user are invisible and unwritable", async () => {
    const userA = await createOwnerCtx("Iso Ticket A");
    const foreign = await createOwnerCtx("Iso Ticket Foreign");

    const created = await fetch(`${baseUrl}/api/support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({
        subject: "Isolation ticket",
        message: "Only user A may ever read or reply to this ticket.",
      }),
    });
    assert.equal(created.status, 201);
    const ticketId = ((await created.json()) as { data: { id: number } }).data.id;

    assert.equal(
      await foreignGet(foreign, `/api/support/tickets/${ticketId}`),
      404,
    );
    assert.equal(
      await foreignGet(
        foreign,
        `/api/support/tickets/${ticketId}/messages`,
        "POST",
        { body: "intrusion" },
      ),
      404,
    );
  });

  it("business detail and mutation reject foreign members", async () => {
    const ownerA = await createOwnerCtx("Iso Biz A");
    const foreign = await createOwnerCtx("Iso Biz Foreign");

    assert.equal(
      await foreignGet(foreign, `/api/businesses/${ownerA.businessId}`),
      403,
    );
    assert.equal(
      await foreignGet(
        foreign,
        `/api/businesses/${ownerA.businessId}/subscription`,
      ),
      403,
    );
    assert.equal(
      await foreignGet(
        foreign,
        `/api/businesses/${ownerA.businessId}`,
        "PUT",
        { name: "Hijacked" },
      ),
      403,
    );
  });

  it("saas admin routes reject ordinary members (not just anonymous)", async () => {
    const owner = await createOwnerCtx("Iso Admin Foreign");
    for (const [method, path, body] of [
      ["GET", "/api/saas/overview", undefined],
      ["GET", "/api/saas/businesses", undefined],
      ["POST", "/api/saas/jobs/run", {}],
      ["GET", "/api/saas/payments", undefined],
      ["GET", "/api/saas/invoices", undefined],
      ["GET", "/api/saas/plans", undefined],
      ["GET", "/api/saas/support/tickets", undefined],
    ] as [string, string, unknown][]) {
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${owner.token}`,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      assert.equal(res.status, 403, `${path} returned ${res.status}`);
    }
  });

  it("security headers are present on API responses", async () => {
    const res = await fetch(`${baseUrl}/healthz`);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(
      res.headers.get("referrer-policy"),
      "strict-origin-when-cross-origin",
    );
  });
});
