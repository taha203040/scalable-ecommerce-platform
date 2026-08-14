import { Request, Response, NextFunction } from "express";

const SERVICE_NAME = process.env.SERVICE_NAME ?? "service";
const IS_DEV = process.env.NODE_ENV !== "production";

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.on("finish", () => {
    const log = {
      timestamp:      new Date().toISOString(),
      correlation_id: req.correlationId,
      method:         req.method,
      path:           req.path,
      status:         res.statusCode,
      duration_ms:    Date.now() - req.startTime,
      service:        SERVICE_NAME,
    };

    if (IS_DEV) {
      // Human-readable in dev
      const status = res.statusCode >= 400 ? `\x1b[31m${res.statusCode}\x1b[0m` : `\x1b[32m${res.statusCode}\x1b[0m`;
      console.log(
        `[${log.timestamp}] ${req.method} ${req.path} → ${status} (${log.duration_ms}ms) | cid: ${log.correlation_id ?? "-"}`
      );
    } else {
      // Structured JSON in prod — picked up by Docker log driver
      process.stdout.write(JSON.stringify(log) + "\n");
    }
  });

  next();
};
