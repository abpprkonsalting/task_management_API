import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  createTaskController,
  listTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from './task.controller';
import * as taskService from './task.service';
import { ValidationError } from '../../shared/errors';

vi.mock('./task.service');

const mockCreateTaskService = vi.mocked(taskService.createTaskService);
const mockListTasksService = vi.mocked(taskService.listTasksService);
const mockGetTaskByIdService = vi.mocked(taskService.getTaskByIdService);
const mockUpdateTaskService = vi.mocked(taskService.updateTaskService);
const mockDeleteTaskService = vi.mocked(taskService.deleteTaskService);

const taskId = '123e4567-e89b-12d3-a456-426614174000';
const responsibleId = '123e4567-e89b-12d3-a456-426614174001';

const createdTask = {
  id: taskId,
  title: 'Test task',
  description: 'A test task',
  status: 'PENDING' as const,
  responsibleId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.resetAllMocks();
});

function buildRequest(body?: unknown, params?: Record<string, string>, query?: Record<string, string>) {
  return {
    body: body ?? {},
    params: params ?? {},
    query: query ?? {},
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
  res.end = ((() => {
    res.ended = true;
    return res;
  }) as unknown) as unknown as Response['end'];
  return res as unknown as TestResponse;
}

type TestNext = ReturnType<typeof vi.fn>;

function buildNext(): TestNext {
  return vi.fn();
}

describe('task controller (unit)', () => {
  describe('createTaskController', () => {
    it('should create a task and return 201', async () => {
      mockCreateTaskService.mockResolvedValue(createdTask);

      const req = buildRequest({
        title: 'Test task',
        description: 'A test task',
        responsibleId,
      });
      const res = buildResponse();
      const next = buildNext();

      await createTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateTaskService).toHaveBeenCalledWith({
        title: 'Test task',
        description: 'A test task',
        responsibleId,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(createdTask);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when body is invalid', async () => {
      const req = buildRequest({ title: '', responsibleId: 'not-a-uuid' });
      const res = buildResponse();
      const next = buildNext();

      await createTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateTaskService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    });

    it('should call next with ValidationError when body is missing', async () => {
      const req = buildRequest(undefined);
      const res = buildResponse();
      const next = buildNext();

      await createTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockCreateTaskService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('listTasksController', () => {
    it('should list tasks with 200', async () => {
      mockListTasksService.mockResolvedValue({
        data: [createdTask],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const req = buildRequest({}, {}, { page: '1', limit: '10' });
      const res = buildResponse();
      const next = buildNext();

      await listTasksController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockListTasksService).toHaveBeenCalledWith({
        status: undefined,
        responsibleId: undefined,
        page: 1,
        limit: 10,
      });
      expect(res.statusCode).toBe(200);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when query is invalid', async () => {
      const req = buildRequest({}, {}, { limit: '999' });
      const res = buildResponse();
      const next = buildNext();

      await listTasksController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockListTasksService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('getTaskByIdController', () => {
    it('should return a task by id with 200', async () => {
      mockGetTaskByIdService.mockResolvedValue(createdTask);

      const req = buildRequest({}, { id: taskId });
      const res = buildResponse();
      const next = buildNext();

      await getTaskByIdController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockGetTaskByIdService).toHaveBeenCalledWith(taskId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(createdTask);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when id is not a UUID', async () => {
      const req = buildRequest({}, { id: 'not-a-uuid' });
      const res = buildResponse();
      const next = buildNext();

      await getTaskByIdController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockGetTaskByIdService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    });
  });

  describe('updateTaskController', () => {
    it('should update a task and return 200', async () => {
      const updated = { ...createdTask, status: 'IN_PROGRESS' as const };
      mockUpdateTaskService.mockResolvedValue(updated);

      const req = buildRequest({ status: 'IN_PROGRESS' }, { id: taskId });
      const res = buildResponse();
      const next = buildNext();

      await updateTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockUpdateTaskService).toHaveBeenCalledWith(taskId, { status: 'IN_PROGRESS' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(updated);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when body is empty', async () => {
      const req = buildRequest({}, { id: taskId });
      const res = buildResponse();
      const next = buildNext();

      await updateTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockUpdateTaskService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    });

    it('should call next with ValidationError when id is not a UUID', async () => {
      const req = buildRequest({ status: 'IN_PROGRESS' }, { id: 'not-a-uuid' });
      const res = buildResponse();
      const next = buildNext();

      await updateTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockUpdateTaskService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  describe('deleteTaskController', () => {
    it('should delete a task and return 204', async () => {
      mockDeleteTaskService.mockResolvedValue(createdTask);

      const req = buildRequest({}, { id: taskId });
      const res = buildResponse();
      const next = buildNext();

      await deleteTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockDeleteTaskService).toHaveBeenCalledWith(taskId);
      expect(res.statusCode).toBe(204);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with ValidationError when id is not a UUID', async () => {
      const req = buildRequest({}, { id: 'not-a-uuid' });
      const res = buildResponse();
      const next = buildNext();

      await deleteTaskController(req as Request, res as unknown as Response, next as unknown as NextFunction);

      expect(mockDeleteTaskService).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect((error as ValidationError).statusCode).toBe(400);
    });
  });
});
