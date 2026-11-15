import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Load test environment variables so `npm run test` works without
// manually exporting DATABASE_URL and NODE_ENV.
dotenv.config({ path: '.env.test' });

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
