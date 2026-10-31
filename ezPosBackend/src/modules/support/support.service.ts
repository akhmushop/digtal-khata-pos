import { db } from "../../db/schema/index.js";
import { supportTickets } from "../../db/schema/supportTickets.js";
import type { ContactInput } from "./support.validation.js";

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
  return ticket;
}
