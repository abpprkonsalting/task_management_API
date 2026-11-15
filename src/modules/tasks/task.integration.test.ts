import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTaskService,
  getTaskByIdService,
  listTasksService,
  updateTaskService,
  deleteTaskService,
} from './task.service';
import { createUserService } from '../users/user.service';

let testUserId: string;

describe('task service (integration)', () => {
  beforeEach(async () => {
    const user = await createUserService({
      name: 'Task Owner',
      email: 'taskowner@example.com',
    });
    testUserId = user.id;
  });

  describe('createTaskService', () => {
    it('should create a task and return it', async () => {
      const task = await createTaskService({
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        responsibleId: testUserId,
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Buy groceries');
      expect(task.description).toBe('Milk, eggs, bread');
      expect(task.status).toBe('PENDING');
      expect(task.responsibleId).toBe(testUserId);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError when responsible user does not exist', async () => {
      await expect(
        createTaskService({
          title: 'Orphan task',
          responsibleId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getTaskByIdService', () => {
    it('should return the created task', async () => {
      const created = await createTaskService({
        title: 'Read book',
        responsibleId: testUserId,
      });

      const found = await getTaskByIdService(created.id);

      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Read book');
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
        getTaskByIdService('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('listTasksService', () => {
    it('should list all tasks with pagination metadata', async () => {
      await createTaskService({ title: 'Task A', responsibleId: testUserId });
      await createTaskService({ title: 'Task B', responsibleId: testUserId });

      const result = await listTasksService({ page: 1, limit: 10 });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
      expect(result.pagination.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should filter by status', async () => {
      const pending = await createTaskService({
        title: 'Pending task',
        status: 'PENDING',
        responsibleId: testUserId,
      });
      await createTaskService({
        title: 'Completed task',
        status: 'COMPLETED',
        responsibleId: testUserId,
      });

      const result = await listTasksService({ status: 'PENDING' });

      const ids = result.data.map((t) => t.id);
      expect(ids).toContain(pending.id);
      expect(result.data.every((t) => t.status === 'PENDING')).toBe(true);
    });

    it('should filter by responsibleId', async () => {
      const owned = await createTaskService({
        title: 'Owned task',
        responsibleId: testUserId,
      });

      const otherUser = await createUserService({
        name: 'Other User',
        email: 'other@example.com',
      });
      await createTaskService({
        title: 'Other task',
        responsibleId: otherUser.id,
      });

      const result = await listTasksService({ responsibleId: testUserId });

      const ids = result.data.map((t) => t.id);
      expect(ids).toContain(owned.id);
      expect(result.data.every((t) => t.responsibleId === testUserId)).toBe(true);
    });

    it('should paginate results', async () => {
      await createTaskService({ title: 'Task 1', responsibleId: testUserId });
      await createTaskService({ title: 'Task 2', responsibleId: testUserId });
      await createTaskService({ title: 'Task 3', responsibleId: testUserId });

      const page1 = await listTasksService({ page: 1, limit: 2 });
      const page2 = await listTasksService({ page: 2, limit: 2 });

      expect(page1.data.length).toBeLessThanOrEqual(2);
      expect(page2.pagination.page).toBe(2);
    });
  });

  describe('updateTaskService', () => {
    it('should update task status', async () => {
      const created = await createTaskService({
        title: 'Start task',
        status: 'PENDING',
        responsibleId: testUserId,
      });

      const updated = await updateTaskService(created.id, {
        status: 'IN_PROGRESS',
      });

      expect(updated.status).toBe('IN_PROGRESS');
      expect(updated.id).toBe(created.id);
    });

    it('should update responsible user', async () => {
      const created = await createTaskService({
        title: 'Reassign task',
        responsibleId: testUserId,
      });

      const otherUser = await createUserService({
        name: 'New Owner',
        email: 'newowner@example.com',
      });

      const updated = await updateTaskService(created.id, {
        responsibleId: otherUser.id,
      });

      expect(updated.responsibleId).toBe(otherUser.id);
    });

    it('should throw NotFoundError when task not found', async () => {
      await expect(
        updateTaskService('00000000-0000-0000-0000-000000000000', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NotFoundError when new responsible user does not exist', async () => {
      const created = await createTaskService({
        title: 'Bad reassign',
        responsibleId: testUserId,
      });

      await expect(
        updateTaskService(created.id, {
          responsibleId: '00000000-0000-0000-0000-000000000000',
        }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('deleteTaskService', () => {
    it('should delete the task', async () => {
      const created = await createTaskService({
        title: 'To delete',
        responsibleId: testUserId,
      });

      await deleteTaskService(created.id);

      await expect(getTaskByIdService(created.id)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(
        deleteTaskService('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
