import type { Request, Response } from "express";
import { sendSafeError } from "../../utils/safeError.js";
import { getBusinessId } from "../../middleware/business.js";
import { listAccessibleLocationIds } from "./locations.service.js";
import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from "./locations.service.js";
import {
  createLocationSchema,
  updateLocationSchema,
} from "./locations.validation.js";

export async function getLocations(req: Request, res: Response) {
  try {
    const data = await listLocations(getBusinessId(req));
    res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    sendSafeError(res, err, "Unable to load locations.");
  }
}

export async function postLocation(req: Request, res: Response) {
  try {
    const result = createLocationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid location data.",
        errors: result.error.flatten(),
      });
    }
    const data = await createLocation(getBusinessId(req), result.data);
    return res.status(201).json({ success: true, data });
  } catch (err: unknown) {
    return sendSafeError(res, err, "Unable to create the location.");
  }
}

export async function patchLocation(req: Request, res: Response) {
  try {
    const locationId = Number(req.params.locationId);
    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid location ID." });
    }
    const result = updateLocationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid location data.",
        errors: result.error.flatten(),
      });
    }
    const data = await updateLocation(
      getBusinessId(req),
      locationId,
      result.data,
    );
    return res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    return sendSafeError(res, err, "Unable to update the location.");
  }
}

export async function removeLocation(req: Request, res: Response) {
  try {
    const locationId = Number(req.params.locationId);
    if (!Number.isInteger(locationId) || locationId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid location ID." });
    }
    await deleteLocation(getBusinessId(req), locationId);
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    return sendSafeError(res, err, "Unable to delete the location.");
  }
}

/** Location ids the CALLER can access — used by the frontend switcher. */
export async function getAccessibleLocations(req: Request, res: Response) {
  try {
    if (!req.user || !req.membership) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }
    const callerIsOwner = req.membership.permissions.includes("*");
    const accessibleIds = new Set(
      await listAccessibleLocationIds(
        getBusinessId(req),
        req.user.id,
        callerIsOwner,
      ),
    );
    const all = await listLocations(getBusinessId(req));
    return res.status(200).json({
      success: true,
      data: all.filter((location) => accessibleIds.has(location.id)),
    });
  } catch (err: unknown) {
    return sendSafeError(res, err, "Unable to load your locations.");
  }
}
