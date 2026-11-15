import { describe, it, expect } from 'vitest';
import {
  createUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  deleteUserService,
} from './user.service';

describe('user service (integration)', () => {
  describe('createUserService', () => {
    it('should create a user and return it', async () => {
      const user = await createUserService({
        name: 'Alice Smith',
        email: 'alice@example.com',
      });

      expect(user.id).toBeDefined();
      expect(user.name).toBe('Alice Smith');
      expect(user.email).toBe('alice@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should reject duplicate email', async () => {
      await createUserService({
        name: 'Bob Jones',
        email: 'bob@example.com',
      });

      await expect(
        createUserService({
          name: 'Bob Duplicate',
          email: 'bob@example.com',
        }),
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        statusCode: 409,
      });
    });
  });

  describe('getUserByIdService', () => {
    it('should return the created user', async () => {
      const created = await createUserService({
        name: 'Carol White',
        email: 'carol@example.com',
      });

      const found = await getUserByIdService(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe('Carol White');
      expect(found.email).toBe('carol@example.com');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        getUserByIdService('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getUsersService', () => {
    it('should return all created users', async () => {
      await createUserService({ name: 'Dave', email: 'dave@example.com' });
      await createUserService({ name: 'Eve', email: 'eve@example.com' });

      const users = await getUsersService();

      expect(users.length).toBeGreaterThanOrEqual(2);
      const emails = users.map((u) => u.email);
      expect(emails).toContain('dave@example.com');
      expect(emails).toContain('eve@example.com');
    });
  });

  describe('updateUserService', () => {
    it('should update user name', async () => {
      const created = await createUserService({
        name: 'Frank',
        email: 'frank@example.com',
      });

      const updated = await updateUserService(created.id, {
        name: 'Francis',
      });

      expect(updated.name).toBe('Francis');
      expect(updated.email).toBe('frank@example.com');
    });

    it('should reject duplicate email on update', async () => {
      await createUserService({ name: 'Grace', email: 'grace@example.com' });
      const heidi = await createUserService({
        name: 'Heidi',
        email: 'heidi@example.com',
      });

      await expect(
        updateUserService(heidi.id, { email: 'grace@example.com' }),
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        statusCode: 409,
      });
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        updateUserService('00000000-0000-0000-0000-000000000000', {
          name: 'Nobody',
        }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('deleteUserService', () => {
    it('should delete the user', async () => {
      const created = await createUserService({
        name: 'Ivan',
        email: 'ivan@example.com',
      });

      await deleteUserService(created.id);

      await expect(getUserByIdService(created.id)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        deleteUserService('00000000-0000-0000-0000-000000000000'),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
