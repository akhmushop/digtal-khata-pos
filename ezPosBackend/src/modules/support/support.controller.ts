import type { Request, Response } from "express";
import { createContactTicket } from "./support.service.js";
import { contactSchema } from "./support.validation.js";
import { sendSafeError } from "../../utils/safeError.js";

/**
 * Public endpoint backing the marketing site's contact page. Rate limited
 * per IP (see contactRateLimit); anonymous by design.
 */
export async function submitContactMessage(req: Request, res: Response) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid contact data.",
    });
  }
  try {
    const ticket = await createContactTicket(parsed.data);
    res.status(201).json({
      success: true,
      message: "Message received. We will get back to you by email.",
      data: { ticketId: ticket?.id },
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to send your message right now.");
  }
}
