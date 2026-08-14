import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status ?? 500;

  const body = {
    error:          err.message ?? "Internal server error",
    code:           status,
    correlation_id: req.correlationId ?? null,
    timestamp:      new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${err.stack}`);
  }

  res.status(status).json(body);
};
