import type { Response } from "express";
import { error } from "node:console";
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
export function handleError(res: Response, err: unknown) {
  console.error(err);
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: message });
}
