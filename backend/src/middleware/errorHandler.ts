import type { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;

  switch (statusCode) {
    case 400:
      res.status(400).json({
        error: err.message || "Invalid request",
      });
      return;

    case 404:
      res.status(404).json({
        error: "Conversation not found",
      });
      return;

    case 429:
      res.status(429).json({
        error: "We're experiencing high demand. Please try again in a moment.",
      });
      return;

    case 503:
      res.status(503).json({
        error: "Our AI assistant is temporarily unavailable. Please try again shortly.",
      });
      return;

    case 500:
    default:
      res.status(500).json({
        error: "Something went wrong on our end. Please try again.",
      });
      return;
  }
}
