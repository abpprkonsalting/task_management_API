import prisma from '../../database/prisma';
import type { Task } from '@prisma/client';

export async function createTask(data: {
  title: string;
  description?: string | null;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  responsibleId: string;
}): Promise<Task> {
  const now = new Date();
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'PENDING',
      responsibleId: data.responsibleId,
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function getTaskById(id: string): Promise<Task | null> {
  return prisma.task.findUnique({
    where: { id },
  });
}

type ListTasksFilters = {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | null;
  responsibleId?: string | null;
  page?: number;
  limit?: number;
};

type PaginatedTasks = {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function listTasks(filters: ListTasksFilters = {}): Promise<PaginatedTasks> {
  const status = filters.status ?? undefined;
  const responsibleId = filters.responsibleId ?? undefined;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (responsibleId) where.responsibleId = responsibleId;

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateTask(
  id: string,
  data: { title?: string; description?: string | null; status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; responsibleId?: string },
): Promise<Task> {
  return prisma.task.update({
    where: { id },
    data,
  });
}

export async function deleteTask(id: string): Promise<Task> {
  return prisma.task.delete({
    where: { id },
  });
}
