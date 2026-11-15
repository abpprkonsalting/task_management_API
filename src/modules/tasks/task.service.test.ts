import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createTaskService,
  getTaskByIdService,
  listTasksService,
  updateTaskService,
  deleteTaskService,
} from './task.service';
import * as taskRepository from './task.repository';
import * as userRepository from '../users/user.repository';

vi.mock('./task.repository');
vi.mock('../users/user.repository');

const mockCreateTask = vi.mocked(taskRepository.createTask);
const mockGetTaskById = vi.mocked(taskRepository.getTaskById);
const mockListTasks = vi.mocked(taskRepository.listTasks);
const mockUpdateTask = vi.mocked(taskRepository.updateTask);
const mockDeleteTask = vi.mocked(taskRepository.deleteTask);
const mockGetUserById = vi.mocked(userRepository.getUserById);

beforeEach(() => {
  vi.resetAllMocks();
});

const taskId = 'task-123';
const userId = 'user-123';
const taskData = {
  id: taskId,
  title: 'Test task',
  description: 'A test task',
  status: 'PENDING' as const,
  responsibleId: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('task service (unit)', () => {
  describe('createTaskService', () => {
    it('should create a task when user exists', async () => {
      mockGetUserById.mockResolvedValue({ id: userId, name: 'John', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() });
      mockCreateTask.mockResolvedValue(taskData);

      const result = await createTaskService({
        title: 'Test task',
        description: 'A test task',
        responsibleId: userId,
      });

      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Test task',
        description: 'A test task',
        responsibleId: userId,
      });
      expect(result).toEqual(taskData);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      mockGetUserById.mockResolvedValue(null);

      await expect(
        createTaskService({
          title: 'Test task',
          responsibleId: 'nonexistent-user',
        }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getTaskByIdService', () => {
    it('should return task when found', async () => {
      mockGetTaskById.mockResolvedValue(taskData);

      const result = await getTaskByIdService(taskId);

      expect(mockGetTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(taskData);
    });

    it('should throw NotFoundError when task not found', async () => {
      mockGetTaskById.mockResolvedValue(null);

      await expect(getTaskByIdService(taskId)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('listTasksService', () => {
    it('should list tasks with pagination', async () => {
      mockListTasks.mockResolvedValue({
        data: [taskData],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const result = await listTasksService({ page: 1, limit: 10 });

      expect(mockListTasks).toHaveBeenCalledWith({
        status: undefined,
        responsibleId: undefined,
        page: 1,
        limit: 10,
      });
      expect(result.pagination.total).toBe(1);
    });

    it('should pass filters through', async () => {
      mockListTasks.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await listTasksService({ status: 'PENDING', responsibleId: userId });

      expect(mockListTasks).toHaveBeenCalledWith({
        status: 'PENDING',
        responsibleId: userId,
        page: undefined,
        limit: undefined,
      });
    });
  });

  describe('updateTaskService', () => {
    it('should update task when found', async () => {
      mockGetTaskById.mockResolvedValue(taskData);
      mockGetUserById.mockResolvedValue({ id: userId, name: 'John', email: 'john@example.com', createdAt: new Date(), updatedAt: new Date() });
      mockUpdateTask.mockResolvedValue({ ...taskData, status: 'IN_PROGRESS' });

      const result = await updateTaskService(taskId, { status: 'IN_PROGRESS' });

      expect(mockGetTaskById).toHaveBeenCalledWith(taskId);
      expect(mockUpdateTask).toHaveBeenCalledWith(taskId, { status: 'IN_PROGRESS' });
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw NotFoundError when task not found', async () => {
      mockGetTaskById.mockResolvedValue(null);

      await expect(
        updateTaskService(taskId, { status: 'IN_PROGRESS' }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NotFoundError when responsible user not found', async () => {
      mockGetTaskById.mockResolvedValue(taskData);
      mockGetUserById.mockResolvedValue(null);

      await expect(
        updateTaskService(taskId, { responsibleId: 'nonexistent-user' }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('deleteTaskService', () => {
    it('should delete task when found', async () => {
      mockGetTaskById.mockResolvedValue(taskData);
      mockDeleteTask.mockResolvedValue(taskData);

      const result = await deleteTaskService(taskId);

      expect(mockGetTaskById).toHaveBeenCalledWith(taskId);
      expect(mockDeleteTask).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(taskData);
    });

    it('should throw NotFoundError when task not found', async () => {
      mockGetTaskById.mockResolvedValue(null);

      await expect(deleteTaskService(taskId)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
