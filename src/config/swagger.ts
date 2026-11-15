import type { SwaggerUiOptions } from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0' as const,
  info: {
    title: 'Task Management API',
    description:
      'A RESTful API for managing tasks, developed with Node.js and TypeScript.',
    version: '1.0.0',
    contact: {
      name: 'Task Management API',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Tasks', description: 'Task management endpoints' },
    { name: 'Health', description: 'Health check endpoint' },
  ],
  paths: {
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Create a user',
        description: 'Creates a new user with a name and email address.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateUserRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Conflict (duplicate email)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Retrieves all users ordered by creation date (newest first).',
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user by ID',
        description: 'Retrieves a single user by its UUID identifier.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User UUID',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        description: 'Creates a new task assigned to a responsible user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTaskRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Responsible user not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        description:
          'Retrieves tasks with optional filtering by status and responsible user, plus offset-based pagination.',
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by task status',
            schema: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
            },
          },
          {
            name: 'responsibleId',
            in: 'query',
            description: 'Filter by responsible user UUID',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number (default 1)',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Page size, max 100 (default 10)',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of tasks',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginatedTasks',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        description: 'Retrieves a single task by its UUID identifier.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task UUID',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Task found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Partially update a task',
        description:
          'Updates one or more fields of an existing task. At least one field is required.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task UUID',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        description: 'Deletes a task by its UUID identifier.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Task UUID',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Task deleted (no content)',
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the health status of the API.',
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
          },
          responsibleId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: [
          'id',
          'title',
          'description',
          'status',
          'responsibleId',
          'createdAt',
          'updatedAt',
        ],
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
      PaginatedTasks: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' },
          },
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
        required: ['data', 'pagination'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok'] },
        },
        required: ['status'],
      },
      ErrorDetail: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['field', 'message'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {
                type: 'array',
                items: { $ref: '#/components/schemas/ErrorDetail' },
              },
            },
            required: ['code', 'message', 'details'],
          },
        },
        required: ['error'],
      },
      CreateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 200 },
          email: { type: 'string', format: 'email', maxLength: 255 },
        },
        required: ['name', 'email'],
      },
      CreateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
          },
          responsibleId: { type: 'string', format: 'uuid' },
        },
        required: ['title', 'responsibleId'],
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string' },
          status: {
            type: 'string',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
          },
          responsibleId: { type: 'string', format: 'uuid' },
        },
      },
    },
  },
} as const;

export const swaggerOptions: SwaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
  },
};
