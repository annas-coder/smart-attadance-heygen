import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({ success: false, message: "Invalid ID format" });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({ success: false, message: "Duplicate entry" });
    return;
  }

  res.status(500).json({ success: false, message: "Internal server error" });
}
