import type { Response } from "express";

export function handleError(res: Response, err: unknown) {
  console.error(err);
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: message });
}
