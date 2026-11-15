import { describe, it, expect } from 'vitest';
import { createUserSchema, getUserByIdParamsSchema } from './user.validation';

describe('user validation schemas (unit)', () => {
  describe('createUserSchema', () => {
    it('should accept a valid user payload', () => {
      const result = createUserSchema.safeParse({
        name: 'Alice Smith',
        email: 'alice@example.com',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Alice Smith');
        expect(result.data.email).toBe('alice@example.com');
      }
    });

    it('should reject a missing name', () => {
      const result = createUserSchema.safeParse({ email: 'alice@example.com' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('name');
      }
    });

    it('should reject an empty name', () => {
      const result = createUserSchema.safeParse({ name: '', email: 'alice@example.com' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('name');
      }
    });

    it('should reject an invalid email', () => {
      const result = createUserSchema.safeParse({ name: 'Alice', email: 'not-an-email' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('email');
      }
    });

    it('should reject a missing email', () => {
      const result = createUserSchema.safeParse({ name: 'Alice' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('email');
      }
    });
  });

  describe('getUserByIdParamsSchema', () => {
    it('should accept a valid UUID', () => {
      const result = getUserByIdParamsSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(result.success).toBe(true);
    });

    it('should reject a non-UUID id', () => {
      const result = getUserByIdParamsSchema.safeParse({ id: 'not-a-uuid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('id');
      }
    });

    it('should reject a missing id', () => {
      const result = getUserByIdParamsSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path.join('.'));
        expect(fields).toContain('id');
      }
    });
  });
});
