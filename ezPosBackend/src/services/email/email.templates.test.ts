import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  renderPasswordReset,
  renderPaymentFailed,
  renderSubscriptionActivated,
  renderTrialEndingSoon,
  renderVerifyEmail,
  renderWelcome,
} from "./email.templates.js";

describe("email templates", () => {
  it("verify-email embeds the action URL in html and text", () => {
    const url = "http://localhost:3001/verify-email?token=abc123";
    const rendered = renderVerifyEmail(url);
    assert.ok(rendered.html.includes(url));
    assert.ok(rendered.text.includes(url));
    assert.match(rendered.subject, /verify/i);
  });

  it("welcome email personalizes the recipient name", () => {
    const rendered = renderWelcome("Arif Hossain");
    assert.ok(rendered.html.includes("Arif Hossain"));
    assert.match(rendered.subject, /welcome/i);
  });

  it("password-reset email links to the reset page", () => {
    const rendered = renderPasswordReset(
      "http://localhost:3001/reset-password?token=tok",
    );
    assert.ok(rendered.html.includes("/reset-password?token=tok"));
  });

  it("trial-ending email links to pricing", () => {
    const rendered = renderTrialEndingSoon(
      "Arif General Store",
      new Date("2026-12-01T00:00:00Z"),
    );
    assert.ok(rendered.html.includes("/pricing"));
    assert.ok(rendered.html.includes("Arif General Store"));
  });

  it("subscription emails carry the plan name", () => {
    const activated = renderSubscriptionActivated("Shop", "Professional");
    assert.ok(activated.html.includes("Professional"));
    const failed = renderPaymentFailed("Shop", "৳1,500", "INV-2026-000001");
    assert.ok(failed.html.includes("INV-2026-000001"));
    assert.ok(failed.html.includes("৳1,500"));
  });

  it("every rendered email includes the ezPos brand", () => {
    for (const rendered of [
      renderVerifyEmail("http://x.test/t"),
      renderWelcome("X"),
      renderPasswordReset("http://x.test/r"),
    ]) {
      assert.ok(rendered.html.includes("ezPos"));
    }
  });
});
