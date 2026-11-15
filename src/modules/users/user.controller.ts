import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  createUserService,
  getUsersService,
  getUserByIdService,
} from './user.service';
import { createUserSchema, getUserByIdParamsSchema } from './user.validation';
import { ValidationError } from '../../shared/errors';

function normalizeError(error: unknown): Error {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return new ValidationError('Request validation failed', details);
  }
  return error as Error;
}

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUserService(data);
    res.status(201).json(user);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function getUsersController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await getUsersService();
    res.status(200).json(users);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = getUserByIdParamsSchema.parse(req.params);
    const user = await getUserByIdService(id);
    res.status(200).json(user);
  } catch (error) {
    next(normalizeError(error));
  }
}
