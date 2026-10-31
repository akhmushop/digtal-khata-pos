import { env } from "../../config/env.js";

/**
 * Reusable transactional email templates. Pure functions — render to
 * {subject, html, text}; delivery goes through services/email/email.service.
 * Keep the HTML simple: these render in real mail clients and carry text
 * counterparts for plain-text preference.
 */

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function layout(title: string, bodyHtml: string): { html: string; text: string } {
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#4f46e5;">ezPos</p>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#64748b;">
      You are receiving this message because of activity on your ezPos account.
    </p>
  </div>
</body></html>`;
  return { html, text: `${title}\n\n${bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}` };
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0 8px;">
    <a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;">${label}</a>
  </p>
  <p style="margin:8px 0 0;font-size:12px;color:#64748b;word-break:break-all;">Or paste this link into your browser: ${url}</p>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;">${text}</p>`;
}

function render(
  subject: string,
  title: string,
  bodyHtml: string,
): RenderedEmail {
  const { html, text } = layout(title, bodyHtml);
  return { subject, html, text };
}

export function renderVerifyEmail(url: string): RenderedEmail {
  return render(
    "Verify your email address",
    "Confirm your email address",
    `${p("Welcome to ezPos! Confirm your email address to finish setting up your account.")}${button(url, "Verify email")}${p("This link expires soon. If you did not create an ezPos account, you can ignore this message.")}`,
  );
}

export function renderWelcome(fullName: string): RenderedEmail {
  return render(
    "Welcome to ezPos",
    `Welcome, ${fullName}!`,
    p(
      "Your ezPos account is ready. Set up your business, add your first products, and start selling — billing, inventory, purchasing, and reports all live in one place.",
    ),
  );
}

export function renderPasswordReset(url: string): RenderedEmail {
  return render(
    "Reset your password",
    "Password reset requested",
    `${p("We received a request to reset the password for your ezPos account. This link works once and expires shortly.")}${button(url, "Choose a new password")}${p("If you did not request this, you can safely ignore this message — your password stays unchanged.")}`,
  );
}

export function renderTrialStarted(
  businessName: string,
  trialDays: number,
  periodEnd: Date,
): RenderedEmail {
  return render(
    "Your free trial has started",
    `Welcome to ezPos, ${businessName}!`,
    `${p(`Your ${trialDays}-day free trial is active until ${periodEnd.toDateString()}. Every core feature is unlocked — billing, inventory, purchasing, and reports.`)}${p("Need a hand getting started? Reply to this email or use the contact page — a real person reads every message.")}`,
  );
}

export function renderTrialEndingSoon(
  businessName: string,
  periodEnd: Date,
): RenderedEmail {
  return render(
    "Your ezPos trial ends soon",
    `${businessName}: your trial ends soon`,
    `${p(`Your free trial ends on ${periodEnd.toDateString()}. Choose a plan to keep billing, inventory, and reports running without interruption.`)}${button(`${env.appUrl}/pricing`, "View plans")}${p("After the trial ends your data stays safe — the account goes read-only until you subscribe.")}`,
  );
}

export function renderSubscriptionActivated(
  businessName: string,
  planName: string,
): RenderedEmail {
  return render(
    "Subscription activated",
    `${businessName} is now on ${planName}`,
    `${p(`Your ${planName} subscription is active. Thank you for supporting ezPos!`)}${button(`${env.appUrl}/account`, "Open your account")}`,
  );
}

export function renderSubscriptionRenewed(
  businessName: string,
  planName: string,
  periodEnd: Date,
): RenderedEmail {
  return render(
    "Subscription renewed",
    `${businessName}: ${planName} renewed`,
    `${p(`Your ${planName} subscription renewed and is active until ${periodEnd.toDateString()}.`)}`,
  );
}

export function renderSubscriptionCanceled(
  businessName: string,
  planName: string,
): RenderedEmail {
  return render(
    "Subscription canceled",
    `${businessName}: subscription canceled`,
    `${p(`Your ${planName} subscription has been canceled. Your data remains available in read-only mode, and you can choose a plan again at any time.`)}${button(`${env.appUrl}/pricing`, "See plans")}`,
  );
}

export function renderSubscriptionExpired(
  businessName: string,
): RenderedEmail {
  return render(
    "Subscription ended",
    `${businessName}: your subscription has ended`,
    `${p("Your subscription has ended and the account is now read-only. Nothing was deleted — subscribe again to pick up right where you left off.")}${button(`${env.appUrl}/pricing`, "Choose a plan")}`,
  );
}

export function renderPaymentSucceeded(
  businessName: string,
  amountLabel: string,
  invoiceNumber: string,
): RenderedEmail {
  return render(
    "Payment received",
    `${businessName}: payment of ${amountLabel} received`,
    `${p(`We received your payment of ${amountLabel} for invoice ${invoiceNumber}. Thank you!`)}`,
  );
}

export function renderPaymentFailed(
  businessName: string,
  amountLabel: string,
  invoiceNumber: string,
): RenderedEmail {
  return render(
    "Payment failed",
    `${businessName}: payment of ${amountLabel} failed`,
    `${p(`The payment of ${amountLabel} for invoice ${invoiceNumber} did not go through. Your account stays fully available during the grace period — retry from your billing page to avoid interruption.`)}`,
  );
}

export function renderInvoiceGenerated(
  businessName: string,
  invoiceNumber: string,
  amountLabel: string,
  periodEnd: Date,
): RenderedEmail {
  return render(
    `Invoice ${invoiceNumber}`,
    `${businessName}: invoice ${invoiceNumber} issued`,
    `${p(`Invoice ${invoiceNumber} for ${amountLabel} was issued for your subscription. Payment is due by ${periodEnd.toDateString()}.`)}`,
  );
}

export function renderSupportTicketReceived(
  submitterName: string,
  subject: string,
): RenderedEmail {
  return render(
    "We received your message",
    `Thanks for reaching out, ${submitterName}`,
    `${p(`We have your message about "${subject}" and will reply by email as soon as we can — usually within two business days.`)}`,
  );
}

export function renderSupportTicketUpdated(
  subject: string,
): RenderedEmail {
  return render(
    "Update on your support request",
    `Update on "${subject}"`,
    `${p("There is an update on your support request. Reply to this email or check your account portal for details.")}`,
  );
}
