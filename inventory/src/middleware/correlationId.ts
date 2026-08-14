import { Request, Response, NextFunction } from "express";

export const correlationId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  req.correlationId = req.headers["x-correlation-id"] as string ?? null;
  req.startTime = Date.now();
  next();
};
