import "express";

declare module "express-serve-static-core" {
  interface Request {
    correlationId: string | null;
    startTime: number;
  }
}
