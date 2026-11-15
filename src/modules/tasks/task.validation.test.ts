import { describe, it, expect } from 'vitest';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskByIdParamsSchema,
  listTasksQuerySchema,
} from './task.validation';

describe('task validation schemas (unit)', () => {
  describe('createTaskSchema', () => {
    it('should accept a valid task payload', () => {
      const result = createTaskSchema.safeParse({
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        status: 'PENDING',
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Buy groceries');
        expect(result.data.status).toBe('PENDING');
      }
    });

    it('should accept a minimal payload (title + responsibleId)', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('should reject a missing title', () => {
      const result = createTaskSchema.safeParse({
        description: 'x',
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('title');
      }
    });

    it('should reject an empty title', () => {
      const result = createTaskSchema.safeParse({
        title: '',
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('title');
      }
    });

    it('should reject an invalid status', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        status: 'ARCHIVED',
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('status');
      }
    });

    it('should reject a missing responsibleId', () => {
      const result = createTaskSchema.safeParse({ title: 'Task' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('responsibleId');
      }
    });

    it('should reject a non-UUID responsibleId', () => {
      const result = createTaskSchema.safeParse({
        title: 'Task',
        responsibleId: 'not-a-uuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('responsibleId');
      }
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept a partial update (status only)', () => {
      const result = updateTaskSchema.safeParse({ status: 'IN_PROGRESS' });

      expect(result.success).toBe(true);
    });

    it('should accept title only', () => {
      const result = updateTaskSchema.safeParse({ title: 'New title' });

      expect(result.success).toBe(true);
    });

    it('should reject an empty body (no fields)', () => {
      const result = updateTaskSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('At least one field is required');
      }
    });

    it('should reject an invalid status', () => {
      const result = updateTaskSchema.safeParse({ status: 'ARCHIVED' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('status');
      }
    });

    it('should reject a non-UUID responsibleId', () => {
      const result = updateTaskSchema.safeParse({ responsibleId: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('responsibleId');
      }
    });
  });

  describe('getTaskByIdParamsSchema', () => {
    it('should accept a valid UUID', () => {
      const result = getTaskByIdParamsSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('should reject a non-UUID id', () => {
      const result = getTaskByIdParamsSchema.safeParse({ id: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('id');
      }
    });
  });

  describe('listTasksQuerySchema', () => {
    it('should accept no query parameters', () => {
      const result = listTasksQuerySchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('should accept valid page and limit', () => {
      const result = listTasksQuerySchema.safeParse({ page: '1', limit: '10' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it('should accept a valid status filter', () => {
      const result = listTasksQuerySchema.safeParse({ status: 'COMPLETED' });

      expect(result.success).toBe(true);
    });

    it('should accept a valid responsibleId filter', () => {
      const result = listTasksQuerySchema.safeParse({
        responsibleId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('should reject an invalid status', () => {
      const result = listTasksQuerySchema.safeParse({ status: 'ARCHIVED' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('status');
      }
    });

    it('should reject limit above maximum', () => {
      const result = listTasksQuerySchema.safeParse({ limit: '999' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('limit');
      }
    });

    it('should reject page below minimum', () => {
      const result = listTasksQuerySchema.safeParse({ page: '0' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('page');
      }
    });

    it('should reject a non-UUID responsibleId filter', () => {
      const result = listTasksQuerySchema.safeParse({ responsibleId: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('responsibleId');
      }
    });
  });
});
