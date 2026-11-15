import { describe, it, expect } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('database connection', () => {
  it('should connect to the test database', async () => {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT now() as now`;
    expect(result).toHaveLength(1);
    expect(result[0].now).toBeInstanceOf(Date);
  });
});
