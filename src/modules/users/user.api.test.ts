import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import userRoutes from './user.routes';
import { notFound } from '../../middleware/not-found';
import { errorHandler } from '../../middleware/error-handler';

const app = express();
app.use(express.json());
app.use('/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

let server: http.Server;

async function request(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ statusCode: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(
      {
        method,
        host: '127.0.0.1',
        port: (server.address() as AddressInfo).port,
        path,
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload).toString(),
            }
          : {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed: unknown = data;
          if (data) {
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = data;
            }
          }
          resolve({ statusCode: res.statusCode ?? 0, body: parsed });
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('user api (HTTP)', () => {
  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      const res = await request('POST', '/users', {
        name: 'Alice Smith',
        email: 'alice@example.com',
      });

      expect(res.statusCode).toBe(201);
      expect((res.body as { id: string }).id).toBeDefined();
      expect((res.body as { name: string }).name).toBe('Alice Smith');
      expect((res.body as { email: string }).email).toBe('alice@example.com');
    });

    it('should return 400 for invalid body', async () => {
      const res = await request('POST', '/users', { name: '', email: 'not-an-email' });

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string; message: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is missing', async () => {
      const res = await request('POST', '/users');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 for duplicate email', async () => {
      await request('POST', '/users', {
        name: 'Bob Jones',
        email: 'bob@example.com',
      });

      const res = await request('POST', '/users', {
        name: 'Bob Duplicate',
        email: 'bob@example.com',
      });

      expect(res.statusCode).toBe(409);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /users', () => {
    it('should return a list of users with 200', async () => {
      await request('POST', '/users', {
        name: 'Carol White',
        email: 'carol@example.com',
      });

      const res = await request('GET', '/users');

      expect(res.statusCode).toBe(200);
      const body = res.body as { length: number };
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id with 200', async () => {
      const created = await request('POST', '/users', {
        name: 'Dave',
        email: 'dave@example.com',
      });
      const id = (created.body as { id: string }).id;

      const res = await request('GET', `/users/${id}`);

      expect(res.statusCode).toBe(200);
      const body = res.body as { id: string; name: string };
      expect(body.id).toBe(id);
      expect(body.name).toBe('Dave');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request('GET', '/users/not-a-uuid');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(
        'GET',
        '/users/00000000-0000-0000-0000-000000000000',
      );

      expect(res.statusCode).toBe(404);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });
});
