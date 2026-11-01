import { db } from "../../db/schema/index.js";
import { supportTickets } from "../../db/schema/supportTickets.js";
import type { ContactInput } from "./support.validation.js";
import { sendEmail } from "../../services/email/email.service.js";
import { renderSupportTicketReceived } from "../../services/email/email.templates.js";

/**
 * Public contact form submissions. No auth and no business context —
 * anyone browsing the marketing site can open a ticket, so keep the
 * payload minimal and validated.
 */
export async function createContactTicket(input: ContactInput) {
  const [ticket] = await db
    .insert(supportTickets)
    .values({ ...input, source: "contact" })
    .returning({
      id: supportTickets.id,
      createdAt: supportTickets.createdAt,
    });

  // Best-effort confirmation email to the submitter.
  void sendEmail({
    to: input.email,
    ...renderSupportTicketReceived(input.name, input.subject),
  }).then((delivery) => {
    if (!delivery.ok) {
      console.error(
        `Support-confirmation email failed for ${input.email}: ${delivery.error}`,
      );
    }
  });

  return ticket;
}
