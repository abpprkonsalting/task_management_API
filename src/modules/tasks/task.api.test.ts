import { describe, it, expect, afterAll, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import http from 'http';
import taskRoutes from './task.routes';
import userRoutes from '../users/user.routes';

const app = express();
app.use(express.json());
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _req;
  void _next;
  if (
    err !== null &&
    typeof err === 'object' &&
    'statusCode' in err &&
    'code' in err
  ) {
    const e = err as {
      statusCode: number;
      code: string;
      message: string;
      details: unknown[];
    };
    return res.status(e.statusCode).json({
      error: { code: e.code, message: e.message, details: e.details },
    });
  }
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error', details: [] },
  });
});

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
        port: (server.address() as { port: number }).port,
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

async function createUser(name: string, email: string): Promise<string> {
  const res = await request('POST', '/users', { name, email });
  expect(res.statusCode).toBe(201);
  return (res.body as { id: string }).id;
}

beforeAll(async () => {
  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('task api (HTTP)', () => {
  let userId: string;

  beforeEach(async () => {
    userId = await createUser('Task Owner', 'taskowner@example.com');
  });

  describe('POST /tasks', () => {
    it('should create a task and return 201', async () => {
      const res = await request('POST', '/tasks', {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        responsibleId: userId,
      });

      expect(res.statusCode).toBe(201);
      const body = res.body as { id: string; title: string; status: string };
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Buy groceries');
      expect(body.status).toBe('PENDING');
    });

    it('should return 400 for invalid body', async () => {
      const res = await request('POST', '/tasks', {
        title: '',
        responsibleId: 'not-a-uuid',
      });

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is missing', async () => {
      const res = await request('POST', '/tasks');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when responsible user does not exist', async () => {
      const res = await request('POST', '/tasks', {
        title: 'Orphan task',
        responsibleId: '00000000-0000-0000-0000-000000000000',
      });

      expect(res.statusCode).toBe(404);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /tasks', () => {
    it('should return a list of tasks with pagination metadata', async () => {
      const res = await request('GET', '/tasks');

      expect(res.statusCode).toBe(200);
      const body = res.body as { data: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should filter by status', async () => {
      await request('POST', '/tasks', {
        title: 'Pending task',
        status: 'PENDING',
        responsibleId: userId,
      });
      await request('POST', '/tasks', {
        title: 'Completed task',
        status: 'COMPLETED',
        responsibleId: userId,
      });

      const res = await request('GET', '/tasks?status=PENDING');

      expect(res.statusCode).toBe(200);
      const body = res.body as { data: { status: string }[] };
      expect(body.data.every((t) => t.status === 'PENDING')).toBe(true);
    });

    it('should filter by responsibleId', async () => {
      const otherUser = await createUser('Other User', 'other@example.com');

      await request('POST', '/tasks', {
        title: 'Owned task',
        responsibleId: userId,
      });
      await request('POST', '/tasks', {
        title: 'Other task',
        responsibleId: otherUser,
      });

      const res = await request('GET', `/tasks?responsibleId=${userId}`);

      expect(res.statusCode).toBe(200);
      const body = res.body as { data: { responsibleId: string }[] };
      expect(body.data.every((t) => t.responsibleId === userId)).toBe(true);
    });

    it('should paginate results', async () => {
      await request('POST', '/tasks', { title: 'Task 1', responsibleId: userId });
      await request('POST', '/tasks', { title: 'Task 2', responsibleId: userId });
      await request('POST', '/tasks', { title: 'Task 3', responsibleId: userId });

      const page1 = await request('GET', '/tasks?page=1&limit=2');
      const page2 = await request('GET', '/tasks?page=2&limit=2');

      expect(page1.statusCode).toBe(200);
      const body1 = page1.body as { data: unknown[]; pagination: { page: number } };
      expect(body1.data.length).toBeLessThanOrEqual(2);
      expect(body1.pagination.page).toBe(1);

      expect(page2.statusCode).toBe(200);
      const body2 = page2.body as { pagination: { page: number } };
      expect(body2.pagination.page).toBe(2);
    });

    it('should return 400 for invalid limit', async () => {
      const res = await request('GET', '/tasks?limit=999');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid page', async () => {
      const res = await request('GET', '/tasks?page=0');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id with 200', async () => {
      const created = await request('POST', '/tasks', {
        title: 'Read book',
        responsibleId: userId,
      });
      const id = (created.body as { id: string }).id;

      const res = await request('GET', `/tasks/${id}`);

      expect(res.statusCode).toBe(200);
      const body = res.body as { id: string; title: string };
      expect(body.id).toBe(id);
      expect(body.title).toBe('Read book');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request('GET', '/tasks/not-a-uuid');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(
        'GET',
        '/tasks/00000000-0000-0000-0000-000000000000',
      );

      expect(res.statusCode).toBe(404);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('should update task status and return 200', async () => {
      const created = await request('POST', '/tasks', {
        title: 'Start task',
        status: 'PENDING',
        responsibleId: userId,
      });
      const id = (created.body as { id: string }).id;

      const res = await request('PATCH', `/tasks/${id}`, { status: 'IN_PROGRESS' });

      expect(res.statusCode).toBe(200);
      const body = res.body as { id: string; status: string };
      expect(body.id).toBe(id);
      expect(body.status).toBe('IN_PROGRESS');
    });

    it('should return 400 when body is empty', async () => {
      const created = await request('POST', '/tasks', {
        title: 'Empty update',
        responsibleId: userId,
      });
      const id = (created.body as { id: string }).id;

      const res = await request('PATCH', `/tasks/${id}`, {});

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request('PATCH', '/tasks/not-a-uuid', { status: 'IN_PROGRESS' });

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(
        'PATCH',
        '/tasks/00000000-0000-0000-0000-000000000000',
        { status: 'IN_PROGRESS' },
      );

      expect(res.statusCode).toBe(404);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task and return 204', async () => {
      const created = await request('POST', '/tasks', {
        title: 'To delete',
        responsibleId: userId,
      });
      const id = (created.body as { id: string }).id;

      const res = await request('DELETE', `/tasks/${id}`);

      expect(res.statusCode).toBe(204);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(
        'DELETE',
        '/tasks/00000000-0000-0000-0000-000000000000',
      );

      expect(res.statusCode).toBe(404);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request('DELETE', '/tasks/not-a-uuid');

      expect(res.statusCode).toBe(400);
      const body = res.body as { error: { code: string } };
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
