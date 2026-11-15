import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Load test environment variables so `npm run test` works without
// manually exporting DATABASE_URL and NODE_ENV.
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

beforeAll(async () => {
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'test' } });
  await prisma.$connect();
});

// Truncate both tables after every test so each test starts with a clean
// database, regardless of which test file ran before it.
afterEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "tasks", "users" RESTART IDENTITY CASCADE;',
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
