import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  createTaskService,
  listTasksService,
  getTaskByIdService,
  updateTaskService,
  deleteTaskService,
} from './task.service';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskByIdParamsSchema,
  listTasksQuerySchema,
} from './task.validation';
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

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await createTaskService(data);
    res.status(201).json(task);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function listTasksController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listTasksQuerySchema.parse(req.query);
    const filters = {
      status: query.status ?? undefined,
      responsibleId: query.responsibleId ?? undefined,
      page: query.page ?? undefined,
      limit: query.limit ?? undefined,
    };
    const result = await listTasksService(filters);
    res.status(200).json(result);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function getTaskByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = getTaskByIdParamsSchema.parse(req.params);
    const task = await getTaskByIdService(id);
    res.status(200).json(task);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function updateTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = getTaskByIdParamsSchema.parse(req.params);
    const data = updateTaskSchema.parse(req.body);
    const task = await updateTaskService(id, data);
    res.status(200).json(task);
  } catch (error) {
    next(normalizeError(error));
  }
}

export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = getTaskByIdParamsSchema.parse(req.params);
    await deleteTaskService(id);
    res.status(204).end();
  } catch (error) {
    next(normalizeError(error));
  }
}
