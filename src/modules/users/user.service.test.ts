import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
  deleteUserService,
} from './user.service';
import * as userRepository from './user.repository';

vi.mock('./user.repository');

const mockCreateUser = vi.mocked(userRepository.createUser);
const mockGetUserByEmail = vi.mocked(userRepository.getUserByEmail);
const mockGetUserById = vi.mocked(userRepository.getUserById);
const mockGetUsers = vi.mocked(userRepository.getUsers);
const mockUpdateUser = vi.mocked(userRepository.updateUser);
const mockDeleteUser = vi.mocked(userRepository.deleteUser);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('user service (unit)', () => {
  const userId = 'user-123';
  const userData = {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createUserService', () => {
    it('should create a user when email is unique', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue(userData);

      const result = await createUserService({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(mockGetUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockCreateUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
      expect(result).toEqual(userData);
    });

    it('should throw ConflictError when email already exists', async () => {
      mockGetUserByEmail.mockResolvedValue(userData);

      await expect(
        createUserService({
          name: 'John Doe',
          email: 'john@example.com',
        }),
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        statusCode: 409,
      });
    });
  });

  describe('getUserByIdService', () => {
    it('should return user when found', async () => {
      mockGetUserById.mockResolvedValue(userData);

      const result = await getUserByIdService(userId);

      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userData);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockGetUserById.mockResolvedValue(null);

      await expect(getUserByIdService(userId)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });

  describe('getUsersService', () => {
    it('should return all users', async () => {
      mockGetUsers.mockResolvedValue([userData]);

      const result = await getUsersService();

      expect(mockGetUsers).toHaveBeenCalled();
      expect(result).toEqual([userData]);
    });
  });

  describe('updateUserService', () => {
    it('should update user when found and email is unique', async () => {
      mockGetUserById.mockResolvedValue(userData);
      mockGetUserByEmail.mockResolvedValue(null);
      mockUpdateUser.mockResolvedValue({ ...userData, name: 'Jane Doe' });

      const result = await updateUserService(userId, { name: 'Jane Doe' });

      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockUpdateUser).toHaveBeenCalledWith(userId, { name: 'Jane Doe' });
      expect(result.name).toBe('Jane Doe');
    });

    it('should throw NotFoundError when user not found', async () => {
      mockGetUserById.mockResolvedValue(null);

      await expect(
        updateUserService(userId, { name: 'Jane Doe' }),
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should throw ConflictError when email already used by another user', async () => {
      const otherUser = { ...userData, id: 'other-user' };
      mockGetUserById.mockResolvedValue(userData);
      mockGetUserByEmail.mockResolvedValue(otherUser);

      await expect(
        updateUserService(userId, { email: 'john@example.com' }),
      ).rejects.toMatchObject({
        code: 'CONFLICT',
        statusCode: 409,
      });
    });
  });

  describe('deleteUserService', () => {
    it('should delete user when found', async () => {
      mockGetUserById.mockResolvedValue(userData);
      mockDeleteUser.mockResolvedValue(userData);

      const result = await deleteUserService(userId);

      expect(mockGetUserById).toHaveBeenCalledWith(userId);
      expect(mockDeleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(userData);
    });

    it('should throw NotFoundError when user not found', async () => {
      mockGetUserById.mockResolvedValue(null);

      await expect(deleteUserService(userId)).rejects.toMatchObject({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
