import "express";

// Per-request correlation id assigned by requestContext middleware.
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
