import { env } from "../../config/env.js";

/**
 * Email delivery with a provider abstraction. Transactional flows call
 * `sendEmail`, which NEVER throws — an email outage must not fail
 * registration or password reset; the caller's own logging plus the
 * returned result surface problems.
 *
 * Providers:
 * - "console" (default): logs the full message. Development mode — the log
 *   is explicit that nothing was sent, so we never pretend delivery happened.
 * - "resend": POSTs to the Resend HTTP API (no SDK dependency).
 * - "none": discards (e.g. test environments that assert DB state instead).
 */

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailDeliveryResult {
  ok: boolean;
  provider: string;
  error?: string;
}

if (env.emailProvider === "resend" && (!env.resendApiKey || !env.emailFrom)) {
  throw new Error(
    "EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM to be configured.",
  );
}

async function sendWithResend(message: EmailMessage): Promise<EmailDeliveryResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        ok: false,
        provider: "resend",
        error: `Resend responded ${response.status}: ${body.slice(0, 300)}`,
      };
    }
    return { ok: true, provider: "resend" };
  } catch (err) {
    return {
      ok: false,
      provider: "resend",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function sendWithConsole(message: EmailMessage): EmailDeliveryResult {
  // Deliberately loud: this mode exists so developers see exactly what
  // WOULD be delivered. It never claims the email was sent.
  console.info(
    [
      "--- EMAIL (console provider — NOT sent) ---",
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      `Text: ${message.text}`,
      "-------------------------------------------",
    ].join("\n"),
  );
  return { ok: true, provider: "console" };
}

export async function sendEmail(
  message: EmailMessage,
): Promise<EmailDeliveryResult> {
  switch (env.emailProvider) {
    case "resend":
      return sendWithResend(message);
    case "none":
      return { ok: true, provider: "none" };
    case "console":
    default:
      return sendWithConsole(message);
  }
}
