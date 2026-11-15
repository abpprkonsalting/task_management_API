import prisma from '../../database/prisma';
import type { User } from '@prisma/client';

export async function createUser(data: {
  name: string;
  email: string;
}): Promise<User> {
  const now = new Date();
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    },
  });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string },
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id },
  });
}
