import { Request, Response, NextFunction } from 'express';

export function notFound(
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  void _req;
  void _next;

  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found', details: [] },
  });
}
