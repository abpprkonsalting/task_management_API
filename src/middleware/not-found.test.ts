import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { notFound } from './not-found';

function mockResponse(): Response & { statusCode?: number; body?: unknown } {
  const res: Record<string, unknown> = {};
  res.status = ((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response['status'];
  res.json = ((data: unknown) => {
    res.body = data;
    return res;
  }) as unknown as Response['json'];
  return res as unknown as Response & { statusCode?: number; body?: unknown };
}

describe('not found middleware (unit)', () => {
  it('should return 404 with structured error for unknown routes', () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    notFound(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route not found', details: [] },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
