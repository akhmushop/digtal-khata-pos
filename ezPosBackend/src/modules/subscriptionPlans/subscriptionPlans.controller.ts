import type { Request, Response } from "express";
import * as subscriptionPlansService from "./subscriptionPlans.service.js";

export async function getSubscriptionPlans(_req: Request, res: Response) {
  try {
    res.json(await subscriptionPlansService.getPublicSubscriptionPlans());
  } catch (err) {
    // Log the real error server-side; return a generic message so database
    // details never reach the client.
    console.error("Failed to load subscription plans:", err);
    res.status(500).json({
      success: false,
      message: "Unable to load subscription plans right now.",
    });
  }
}
