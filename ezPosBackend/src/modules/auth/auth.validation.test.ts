import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, registerSchema, verifyEmailSchema } from "./auth.validation.js";
import { createBusinessSchema, updateBusinessSchema } from "../businesses/businesses.validation.js";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Arif Hossain",
      email: "Arif@Example.com ",
      password: "strong-password-123",
      phone: "+880 1712-345678",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      // Email is normalized to lowercase.
      assert.equal(parsed.data.email, "arif@example.com");
    }
  });

  it("accepts registration with the optional phone omitted (regression)", () => {
    // Regression: .optional() after .transform()/.pipe() used to require the
    // raw field to be a string, rejecting every request without a phone.
    const parsed = registerSchema.safeParse({
      fullName: "Arif Hossain",
      email: "arif@example.com",
      password: "strong-password-123",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.phone, undefined);
    }
  });

  it("treats an empty optional phone as absent", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Arif Hossain",
      email: "arif@example.com",
      password: "strong-password-123",
      phone: "   ",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects short passwords, invalid emails, and short names", () => {
    assert.equal(
      registerSchema.safeParse({ fullName: "Arif", email: "a@b.com", password: "short" })
        .success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({ fullName: "Arif", email: "not-an-email", password: "longenough1" })
        .success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({ fullName: "A", email: "a@b.com", password: "longenough1" })
        .success,
      false,
    );
  });

  it("rejects invalid phone numbers when provided", () => {
    assert.equal(
      registerSchema.safeParse({ fullName: "Arif Hossain", email: "a@b.com", password: "longenough1", phone: "abc" })
        .success,
      false,
    );
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials and normalizes the email", () => {
    const parsed = loginSchema.safeParse({
      email: "  USER@Example.COM ",
      password: "whatever",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.email, "user@example.com");
    }
  });

  it("rejects empty passwords", () => {
    assert.equal(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success,
      false,
    );
  });
});

describe("verifyEmailSchema", () => {
  it("requires a token", () => {
    assert.equal(verifyEmailSchema.safeParse({ token: "short" }).success, false);
    assert.equal(verifyEmailSchema.safeParse({}).success, false);
    assert.equal(verifyEmailSchema.safeParse({ token: "a-long-enough-token-value" }).success, true);
  });
});

describe("business schemas", () => {
  it("accepts business creation with only a name (regression)", () => {
    const parsed = createBusinessSchema.safeParse({ name: "Arif General Store" });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.phone, undefined);
      assert.equal(parsed.data.email, undefined);
      assert.equal(parsed.data.address, undefined);
    }
  });

  it("accepts business update with no fields provided (no-op)", () => {
    const parsed = updateBusinessSchema.safeParse({});
    assert.equal(parsed.success, true);
  });

  it("rejects business creation with a malformed phone", () => {
    assert.equal(
      createBusinessSchema.safeParse({ name: "Arif General Store", phone: "abc" })
        .success,
      false,
    );
  });
});
