import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './error-handler';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../shared/errors';

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

describe('error handler (unit)', () => {
  it('should return structured response for NotFoundError with 404', () => {
    const err = new NotFoundError('Task', 'missing-id');
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Task with id "missing-id" not found',
        details: [{ resource: 'Task', id: 'missing-id' }],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return structured response for ConflictError with 409', () => {
    const err = new ConflictError('Email already in use', [
      { field: 'email', value: 'a@b.com', issue: 'duplicate' },
    ]);
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Email already in use',
        details: [{ field: 'email', value: 'a@b.com', issue: 'duplicate' }],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return structured response for ValidationError with 400', () => {
    const err = new ValidationError('Request validation failed', [
      { field: 'name', message: 'Name is required' },
    ]);
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: [{ field: 'name', message: 'Name is required' }],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors as 500 INTERNAL_ERROR', () => {
    const err = new Error('unexpected boom');
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'unexpected boom',
        details: [],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle non-Error thrown values as 500', () => {
    const err = 'string error';
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as unknown as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: [],
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
