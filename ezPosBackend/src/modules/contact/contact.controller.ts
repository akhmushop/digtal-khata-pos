import type { NextFunction, Request, Response } from "express";
import * as contactService from "../contact/contact.service.js";
import { supplierSchema } from "./schemas/supplier.schema.js";
export async function createSupplier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = supplierSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Supplier data",
        errors: result.error.flatten(),
      });
    }
    const supplier = await contactService.createSupplier(result.data);
    return res.status(201).json({
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (err: unknown) {
    next(err);
  }
}
