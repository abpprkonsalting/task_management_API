import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  createUserController,
  getUsersController,
  getUserByIdController,
} from './user.controller';
import * as userService from './user.service';
import { ValidationError } from '../../shared/errors';

vi.mock('./user.service');

const mockCreateUserService = vi.mocked(userService.createUserService);
const mockGetUsersService = vi.mocked(userService.getUsersService);
const mockGetUserByIdService = vi.mocked(userService.getUserByIdService);

const createdUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Alice Smith',
  email: 'alice@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

function buildRequest(body?: unknown, params?: Record<string, string>) {
  return {
    body: body ?? {},
    params: params ?? {},
  } as unknown as Request;
}

type TestResponse = Response & { statusCode?: number; body?: unknown };

function buildResponse(): TestResponse {
  const res: Record<string, unknown> = {};
  res.status = ((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response['status'];
  res.json = ((data: unknown) => {
    res.body = data;
    return res;
  }) as unknown as Response['json'];
  return res as unknown as TestResponse;
}

type TestNext = ReturnType<typeof vi.fn>;

function buildNext(): TestNext {
  return vi.fn();
}

describe('user controller (unit)', () => {
  describe('createUserController', () => {
    it('should create a user and return 201', async () => {
      mockCreateUserService.mockResolvedValue(createdUser);

      const req = buildRequest({ name: 'Alice Smith', email: 'alice@example.com' });
      const res = buildResponse();
      const next = buildNext();

      await createUserController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateUserService).toHaveBeenCalledWith({
        name: 'Alice Smith',
        email: 'alice@example.com',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when body is invalid', async () => {
      const req = buildRequest({ name: '', email: 'not-an-email' });
      const res = buildResponse();
      const next = buildNext();

      await createUserController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateUserService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
      expect((error as ValidationError).code).toBe('VALIDATION_ERROR');
    });

    it('should call next with ValidationError when body is missing', async () => {
      const req = buildRequest(undefined);
      const res = buildResponse();
      const next = buildNext();

      await createUserController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateUserService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('getUsersController', () => {
    it('should return all users with 200', async () => {
      mockGetUsersService.mockResolvedValue([createdUser]);

      const req = buildRequest();
      const res = buildResponse();
      const next = buildNext();

      await getUsersController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockGetUsersService).toHaveBeenCalledTimes(1);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([createdUser]);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getUserByIdController', () => {
    it('should return a user by id with 200', async () => {
      mockGetUserByIdService.mockResolvedValue(createdUser);

      const req = buildRequest({}, { id: createdUser.id });
      const res = buildResponse();
      const next = buildNext();

      await getUserByIdController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockGetUserByIdService).toHaveBeenCalledWith(createdUser.id);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(createdUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when id is not a UUID', async () => {
      const req = buildRequest({}, { id: 'not-a-uuid' });
      const res = buildResponse();
      const next = buildNext();

      await getUserByIdController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockGetUserByIdService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    });
  });
});
