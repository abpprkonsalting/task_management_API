import { execSync } from 'child_process';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Ensure test environment variables are loaded
const prisma = new PrismaClient();

export async function cleanDb() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(async () => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test' } });
  await prisma.$connect();
});

afterEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
