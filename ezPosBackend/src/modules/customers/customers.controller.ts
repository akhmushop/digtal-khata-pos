import type { Request, Response } from "express";
import * as customersService from "./customers.service.js";
import { handleError } from "../../utils/handleError.js";

export async function getCustomers(req: Request, res: Response) {
  try {
    res.json(await customersService.getCustomers());
  } catch (err) {
    handleError(res, err);
  }
}
export async function createCustomer(req: Request, res: Response) {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({
        error: "Name and phone are required",
      });
    }
    const customer = await customersService.createCustomer(
      name,
      phone,
      address,
    );
    res.status(201).json(customer);
  } catch (err) {
    handleError(res, err);
  }
}
export async function getCustomerDueSummary(req: Request, res: Response) {
  try {
    const result = await customersService.getCustomerDueSummary();
    res.status(200).json(result);
  } catch (err) {
    handleError(res, err);
  }
}
