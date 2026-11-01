import type { Request, Response } from "express";
import {
  createPlan,
  deleteOrArchivePlan,
  listAllPlansAdmin,
  updatePlan,
} from "./subscriptionPlans.admin.service.js";
import {
  createPlanSchema,
  updatePlanSchema,
} from "./subscriptionPlans.admin.validation.js";
import { sendSafeError } from "../../utils/safeError.js";

export async function getAllPlansAdmin(_req: Request, res: Response) {
  try {
    res.status(200).json({ success: true, data: await listAllPlansAdmin() });
  } catch (err) {
    sendSafeError(res, err, "Unable to load plans right now.");
  }
}

export async function createPlanAdmin(req: Request, res: Response) {
  const parsed = createPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid plan data.",
    });
  }
  try {
    res.status(201).json({
      success: true,
      data: await createPlan(parsed.data),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to create the plan right now.");
  }
}

export async function updatePlanAdmin(req: Request, res: Response) {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId) || planId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid plan ID is required." });
  }
  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid plan data.",
    });
  }
  try {
    res.status(200).json({
      success: true,
      data: await updatePlan(planId, parsed.data),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to update the plan right now.");
  }
}

export async function deletePlanAdmin(req: Request, res: Response) {
  const planId = Number(req.params.planId);
  if (!Number.isInteger(planId) || planId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "A valid plan ID is required." });
  }
  try {
    res.status(200).json({
      success: true,
      data: await deleteOrArchivePlan(planId),
    });
  } catch (err) {
    sendSafeError(res, err, "Unable to delete the plan right now.");
  }
}
