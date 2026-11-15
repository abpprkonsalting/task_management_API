import {
  ConflictError,
  NotFoundError,
} from '../../shared/errors';
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
} from './user.repository';

export async function createUserService(data: {
  name: string;
  email: string;
}) {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new ConflictError('Email already in use', [
      { field: 'email', value: data.email, issue: 'duplicate' },
    ]);
  }
  return createUser(data);
}

export async function getUserByIdService(id: string) {
  const user = await getUserById(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
}

export async function getUsersService() {
  return getUsers();
}

export async function updateUserService(
  id: string,
  data: { name?: string; email?: string },
) {
  await getUserByIdService(id);
  if (data.email) {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new ConflictError('Email already in use', [
        { field: 'email', value: data.email, issue: 'duplicate' },
      ]);
    }
  }
  return updateUser(id, data);
}

export async function deleteUserService(id: string) {
  await getUserByIdService(id);
  return deleteUser(id);
}
