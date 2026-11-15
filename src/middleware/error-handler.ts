import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  void _req;
  void _next;

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message = err instanceof Error ? err.message : 'Internal server error';
  const details = err instanceof AppError ? err.details : [];

  res.status(statusCode).json({
    error: { code, message, details },
  });
}
