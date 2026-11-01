import type { Request, Response } from "express";
import {
  addTicketMessage,
  createTicketForUser,
  getTicketForUser,
  listUserTickets,
} from "./supportPortal.service.js";
import {
  createTicketSchema,
  ticketMessageSchema,
} from "../subscriptions/subscriptions.validation.js";
import { sendSafeError } from "../../utils/safeError.js";

export async function getMyTickets(req: Request, res: Response) {
  try {
    res.status(200).json({
      success: true,
      data: await listUserTickets(req.user!.id),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to load your tickets right now.");
  }
}

export async function createMyTicket(req: Request, res: Response) {
  const parsed = createTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid ticket data.",
    });
  }
  try {
    const ticket = await createTicketForUser(req.user!.id, parsed.data);
    res.status(201).json({
      success: true,
      message: "Ticket created. We will reply by email and in this thread.",
      data: ticket,
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to create the ticket right now.");
  }
}

export async function getMyTicket(req: Request, res: Response) {
  const ticketId = Number(req.params.ticketId);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid ticket ID is required." });
  }
  try {
    const ticket = await getTicketForUser(req.user!.id, ticketId);
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    // Foreign tickets return the same "not found" as missing ones.
    sendSafeError(res, err, "Ticket not found.");
  }
}

export async function replyToMyTicket(req: Request, res: Response) {
  const ticketId = Number(req.params.ticketId);
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid ticket ID is required." });
  }
  const parsed = ticketMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Enter a message.",
    });
  }
  try {
    const message = await addTicketMessage(
      req.user!.id,
      ticketId,
      parsed.data,
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    sendSafeError(res, err, "Unable to add your reply right now.");
  }
}
