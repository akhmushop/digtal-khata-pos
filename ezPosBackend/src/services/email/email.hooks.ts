import { eq } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { businesses } from "../../db/schema/businesses.js";
import { users } from "../../db/schema/users.js";
import { sendEmail } from "./email.service.js";
import {
  renderPaymentSucceeded,
  renderRenewalReminder,
  renderSubscriptionRenewed,
  renderSubscriptionActivated,
  renderSubscriptionCanceled,
  renderSubscriptionExpired,
  renderTrialEndingSoon,
} from "./email.templates.js";

/**
 * Lifecycle email hooks for the subscription service. All best-effort:
 * a delivery failure is logged and never rolls back the business change
 * that produced it.
 */

async function businessOwnerEmail(
  businessId: number,
): Promise<{ email: string; businessName: string } | null> {
  const [row] = await db
    .select({
      email: users.email,
      businessName: businesses.name,
    })
    .from(businesses)
    .innerJoin(users, eq(users.id, businesses.createdByUserId))
    .where(eq(businesses.id, businessId));
  return row ?? null;
}

export function notifySubscriptionActivated(
  businessId: number,
  planName: string,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderSubscriptionActivated(
      target.businessName,
      planName,
    );
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Subscription-activated email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifySubscriptionRenewed(
  businessId: number,
  planName: string,
  periodEnd: Date,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderSubscriptionRenewed(
      target.businessName,
      planName,
      periodEnd,
    );
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Subscription-renewed email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifySubscriptionCanceled(
  businessId: number,
  planName: string,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderSubscriptionCanceled(
      target.businessName,
      planName,
    );
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Subscription-canceled email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifyPaymentSucceeded(
  businessId: number,
  amountLabel: string,
  invoiceNumber: string,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderPaymentSucceeded(
      target.businessName,
      amountLabel,
      invoiceNumber,
    );
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Payment-succeeded email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifyTrialEnding(
  businessId: number,
  periodEnd: Date,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderTrialEndingSoon(target.businessName, periodEnd);
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Trial-ending email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifyRenewalReminder(
  businessId: number,
  planName: string,
  periodEnd: Date,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderRenewalReminder(
      target.businessName,
      planName,
      periodEnd,
    );
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Renewal-reminder email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}

export function notifySubscriptionExpired(
  businessId: number,
): void {
  void (async () => {
    const target = await businessOwnerEmail(businessId);
    if (!target) return;
    const rendered = renderSubscriptionExpired(target.businessName);
    const delivery = await sendEmail({ to: target.email, ...rendered });
    if (!delivery.ok) {
      console.error(
        `Subscription-expired email failed for ${target.email}: ${delivery.error}`,
      );
    }
  })();
}
