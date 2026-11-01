import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "./support.validation.js";

describe("support.validation contactSchema", () => {
  const validInput = {
    name: "Rahim Uddin",
    email: "rahim@example.com",
    subject: "Question about plans",
    message: "I would like to know more about the yearly pricing.",
  };

  it("accepts a valid contact submission", () => {
    const parsed = contactSchema.safeParse(validInput);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.email, "rahim@example.com");
      assert.equal(parsed.data.phone, undefined);
    }
  });

  it("accepts and trims an optional phone number", () => {
    const parsed = contactSchema.safeParse({ ...validInput, phone: " +8801712345678 " });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.phone, "+8801712345678");
    }
  });

  it("treats an empty phone as absent", () => {
    const parsed = contactSchema.safeParse({ ...validInput, phone: "   " });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.phone, undefined);
    }
  });

  it("rejects an invalid email", () => {
    const parsed = contactSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    assert.equal(parsed.success, false);
  });

  it("rejects a too-short message", () => {
    const parsed = contactSchema.safeParse({ ...validInput, message: "hi" });
    assert.equal(parsed.success, false);
  });

  it("rejects a too-long message", () => {
    const parsed = contactSchema.safeParse({
      ...validInput,
      message: "x".repeat(5001),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects a malformed phone number", () => {
    const parsed = contactSchema.safeParse({
      ...validInput,
      phone: "call me tomorrow",
    });
    assert.equal(parsed.success, false);
  });

  it("normalizes the email to lowercase", () => {
    const parsed = contactSchema.safeParse({
      ...validInput,
      email: "ShopOwner@Example.COM",
    });
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.email, "shopowner@example.com");
    }
  });
});
