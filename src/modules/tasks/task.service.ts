import {
  NotFoundError,
} from '../../shared/errors';
import {
  createTask,
  getTaskById,
  listTasks,
  updateTask,
  deleteTask,
} from './task.repository';
import { getUserById } from '../users/user.repository';

export async function createTaskService(data: {
  title: string;
  description?: string | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  responsibleId: string;
}) {
  const user = await getUserById(data.responsibleId);
  if (!user) {
    throw new NotFoundError('User', data.responsibleId);
  }
  return createTask(data);
}

export async function getTaskByIdService(id: string) {
  const task = await getTaskById(id);
  if (!task) {
    throw new NotFoundError('Task', id);
  }
  return task;
}

export async function listTasksService(filters: {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | null;
  responsibleId?: string | null;
  page?: number;
  limit?: number;
}) {
  return listTasks({
    status: filters.status ?? undefined,
    responsibleId: filters.responsibleId ?? undefined,
    page: filters.page,
    limit: filters.limit,
  });
}

export async function updateTaskService(
  id: string,
  data: { title?: string; description?: string | null; status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; responsibleId?: string },
) {
  await getTaskByIdService(id);

  if (data.responsibleId) {
    const user = await getUserById(data.responsibleId);
    if (!user) {
      throw new NotFoundError('User', data.responsibleId);
    }
  }

  return updateTask(id, data);
}

export async function deleteTaskService(id: string) {
  await getTaskByIdService(id);
  return deleteTask(id);
}
