# Task Management API

A RESTful API for managing tasks, developed with Node.js and TypeScript.

This project was created as a technical assessment to demonstrate backend development, REST API design, database integration, automated testing, CI/CD, and technical documentation.

---

## 1. Project Overview

### Purpose

Describe the purpose of the application and the problem it solves.

### Main Features

- Task creation, retrieval, updating, and deletion.
- Task filtering by status and assignee.
- Paginated task listing.
- Input validation and structured error handling.
- Persistent database storage.
- Automated testing.
- API documentation through OpenAPI/Swagger.

### Project Status

Implementation complete. All 10 implementation stages have been delivered and merged into `master`:

- Project initialization, TypeScript/Prisma setup, and health check endpoint (`GET /health`).
- Vitest test configuration with an isolated test database and a ≥90% coverage target.
- `users` and `tasks` database schema with Prisma migrations.
- User and task repository/service layers.
- User and task REST API endpoints with Zod validation.
- Centralized error handling and 404 middleware.
- OpenAPI/Swagger documentation at `/api-docs`.

Type checking (`tsc --noEmit`) and linting (`eslint src`) pass cleanly. The full test suite passes against the isolated test database.

---

## 2. Requirements and Scope

### Functional Requirements

- Create a task.
- Retrieve a task by its identifier.
- List tasks with filtering and pagination.
- Update an existing task.
- Delete a task.
- Filter tasks by status.
- Filter tasks by assignee.
- Paginated task listing.
- Persistent storage in a relational database with migrations.
- Automated testing targeting at least 90% code coverage across unit, integration, and API/HTTP test levels.
- API documentation through OpenAPI/Swagger.

### Non-Functional Requirements

- Maintainability: clear structure, separation of concerns, meaningful commits.
- Reliability: consistent HTTP status codes, predictable error responses.
- Validation: input validation at the API boundary.
- Error handling: centralized error handling, no exposure of internal details.
- Testability: isolated test database, unit/integration/API test levels.
- Documentation: README as central document, API contract documented.
- Deployment: GitHub Actions CI/CD, deployment triggered by `master` merges (not tags).
- Scope proportionality: no unnecessary abstractions or infrastructure.
- Cost: free tools and services wherever possible.

### Scope and Limitations

Included in the initial implementation:

- Task CRUD operations.
- Filtering by status and assignee.
- Offset-based pagination.
- Relational database (PostgreSQL) with Prisma migrations.
- Automated unit, integration, and API/HTTP tests targeting at least 90% code coverage.
- GitHub Actions CI running on feature branches and Pull Requests.
- Automatic deployment to a Debian 13 VPS on `master` merges.
- OpenAPI/Swagger API documentation.
- Public demonstration using fictitious data.

Deliberately excluded:

- Authentication and authorization.
- Microservices, distributed systems, or event-driven architecture.
- CQRS, event sourcing, or complex hexagonal patterns.
- Paid services or subscriptions.
- Git tags or GitHub releases as deployment triggers.
- Direct commits or pushes to `master`.

---

## 3. Technical Stack

Technologies selected and used:

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js | Application runtime |
| Language | TypeScript | Type-safe application development |
| HTTP framework | Express | REST API server and routing |
| Database | PostgreSQL | Relational data persistence |
| ORM | Prisma | Database access, schema management, migrations |
| Validation | Zod | Request and data validation |
| Testing | Vitest | Automated unit, integration, and API/HTTP tests |
| API documentation | OpenAPI / Swagger | Interactive API contract documentation |
| CI/CD | GitHub Actions | Automated verification and deployment |
| Hosting | Debian 13 VPS | Public demonstration environment |
| Process management | systemd | Application process management |
| Reverse proxy | Apache | HTTPS termination and request forwarding |

---

## 4. Architecture and Design Decisions

### 4.1 Application Architecture

Layered architecture within a modular monolith — a single deployable service with clear separation of responsibilities across layers:

- HTTP routing and request handling.
- Request validation at the API boundary.
- Business logic.
- Data persistence.
- Database configuration.
- Error handling.
- Application configuration.

Microservices, distributed systems, event-driven architectures, CQRS, and complex hexagonal patterns are deliberately avoided as disproportionate to the project scope.

### 4.2 Project Structure

```
src/
├── app.ts
├── server.ts
├── database.test.ts
│
├── config/
│   └── swagger.ts
│
├── database/
│   └── prisma.ts
│
├── modules/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.routes.ts
│   │   ├── user.repository.ts
│   │   ├── user.service.ts
│   │   └── user.validation.ts
│   │
│   └── tasks/
│       ├── task.controller.ts
│       ├── task.routes.ts
│       ├── task.repository.ts
│       ├── task.service.ts
│       └── task.validation.ts
│
├── middleware/
│   ├── error-handler.ts
│   └── not-found.ts
│
└── shared/
    └── errors/
```

Each module directory also contains its corresponding `*.test.ts` files (unit, controller, API, integration, validation). Test helpers live in `tests/setup.ts`.

Component responsibilities:

| Component | Responsibility |
|-----------|----------------|
| `app.ts` | Creates and configures the Express application |
| `server.ts` | Starts the HTTP server |
| `config/` | Application configuration (Swagger/OpenAPI spec) |
| `database/` | Prisma client configuration |
| `modules/users/` | User module (routes, controller, service, repository, validation) |
| `modules/tasks/` | Task module (routes, controller, service, repository, validation) |
| `middleware/` | Centralized error handling and 404 for unknown routes |
| `shared/` | Genuinely reusable application components (shared error classes) |
| `tests/` | Global test setup helpers |

### 4.3 Data Model

**USERS table:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `name` | VARCHAR(200) | Yes | User full name |
| `email` | VARCHAR(255) | Yes | User email (unique) |
| `createdAt` | TIMESTAMP | Yes | Creation timestamp |
| `updatedAt` | TIMESTAMP | Yes | Last modification timestamp |

**Task entity:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `title` | VARCHAR(200) | Yes | Task title |
| `description` | TEXT | No | Task description |
| `status` | ENUM | Yes | `PENDING` \| `IN_PROGRESS` \| `COMPLETED` |
| `responsibleId` | UUID | Yes | Foreign key → `USERS.id` |
| `createdAt` | TIMESTAMP | Yes | Creation timestamp |
| `updatedAt` | TIMESTAMP | Yes | Last modification timestamp |

**Pagination tie-break + indexes**

Deterministic ordering uses `createdAt DESC` with `id` as tie-break. Indexes:

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | Primary key (`id`) | Entity lookup |
| `users` | Unique (`email`) | Uniqueness enforcement |
| `tasks` | Primary key (`id`) | Entity lookup |
| `tasks` | (`status`, `responsibleId`, `createdAt` DESC, `id`) | Filtered pagination with deterministic tie-break |
| `tasks` | (`responsibleId`) | Filtering by responsible |

Foreign key: `tasks.responsibleId → users.id`.

### 4.4 API Design

**Base URL:** `http://localhost:3000` (local), public demonstration URL documented in Section 11.

**Endpoints:**

| Method | Endpoint | Purpose | Success Status |
|--------|----------|---------|----------------|
| GET | `/health` | Health check | 200 OK |
| POST | `/users` | Create a user | 201 Created |
| GET | `/users` | List users | 200 OK |
| GET | `/users/:id` | Retrieve a user | 200 OK |
| POST | `/tasks` | Create a task | 201 Created |
| GET | `/tasks` | List tasks with filtering and pagination | 200 OK |
| GET | `/tasks/:id` | Retrieve a task | 200 OK |
| PATCH | `/tasks/:id` | Partially update a task | 200 OK |
| DELETE | `/tasks/:id` | Delete a task | 204 No Content |

PATCH is used for partial updates (e.g., updating only the status). PUT is not implemented; complete resource replacement is not required.

**Users request/response:**

Create user (`POST /users`):
- Request body: `{ name: string, email: string }`
- Response (201): `{ id: uuid, name: string, email: string, createdAt: timestamp, updatedAt: timestamp }`

List users (`GET /users`):
- Response (200): `{ data: user[], pagination: { page, limit, total, totalPages } }`

Get user (`GET /users/:id`):
- Path parameter: `id` (UUID, validated)
- Response (200): single user object
- Response (404): user not found

**Tasks request/response:**

Create task (`POST /tasks`):
- Request body: `{ title: string, description?: string, status?: 'PENDING' \| 'IN_PROGRESS' \| 'COMPLETED', responsibleId: uuid }`
- Response (201): `{ id: uuid, title: string, description?: string, status: string, responsibleId: uuid, createdAt: timestamp, updatedAt: timestamp }`

List tasks (`GET /tasks`):
- Query parameters: `status` (optional enum), `responsibleId` (optional UUID), `page` (positive int, default 1), `limit` (positive int, default 10, max 100)
- Response (200): `{ data: task[], pagination: { page, limit, total, totalPages } }`

Get task (`GET /tasks/:id`):
- Path parameter: `id` (UUID, validated)
- Response (200): single task object
- Response (404): task not found

Update task (`PATCH /tasks/:id`):
- Path parameter: `id` (UUID, validated)
- Request body: partial task fields (at least one field required)
- Response (200): updated task object
- Response (404): task not found

Delete task (`DELETE /tasks/:id`):
- Path parameter: `id` (UUID, validated)
- Response (204): no content
- Response (404): task not found

**Filtering:**

Filters `status` and `responsibleId` are optional and can be combined:
```
GET /tasks?status=PENDING&responsibleId=<uuid>
```
Invalid filter values return 400. String matching is exact and case-sensitive. Empty filter values are ignored.

**Pagination:**

Offset-based pagination with deterministic ordering (`createdAt DESC`, `id` as tie-break).
```
GET /tasks?page=1&limit=10
```
- Default page: 1
- Default page size: 10
- Maximum page size: 100
- Invalid parameters return 400

Pagination response metadata:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**HTTP status codes:**

| Code | Meaning | Typical Use |
|------|---------|-------------|
| 200 | OK | Successful retrieval or update |
| 201 | Created | Resource successfully created |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid request data or parameters |
| 404 | Not Found | Requested resource does not exist |
| 409 | Conflict | Actual resource or database conflict |
| 500 | Internal Server Error | Unexpected server-side error |

**Validation:**

Zod schemas validate: task creation, task updates, path parameters (`id` as UUID), filtering parameters (`status`, `responsibleId`), and pagination parameters (`page`, `limit`).

**Error response format:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

No stack traces, credentials, or internal details exposed to API consumers.

**API documentation:**

OpenAPI/Swagger documentation generated from the implemented endpoints and kept synchronized with the actual API.

### 4.5 Validation and Error Handling

Validation performed at the application boundary using Zod schemas covering task creation, updates, path parameters, filtering, and pagination parameters.

Centralized error-handling strategy with consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Distinguishes validation errors, invalid parameters, missing resources, database constraint violations, connectivity failures, and unexpected errors. No stack traces, credentials, or internal details exposed to API consumers.

### 4.6 Architectural Decisions

| Decision | Chosen Option | Alternatives Considered | Rationale |
|----------|---------------|------------------------|-----------|
| HTTP framework | Express | NestJS | Express is lightweight and appropriate for this assessment scope; NestJS adds abstraction layers and conventions disproportionate to a small CRUD API. |
| Relational database | PostgreSQL | SQLite | PostgreSQL is production-oriented and consistent across development, testing, and production. SQLite would require engine switching for the public VPS deployment, introducing avoidable compatibility considerations. |
| ORM / database access | Prisma | Raw SQL, TypeORM, Sequelize | Prisma provides a typed client and built-in migration support with minimal boilerplate. Raw SQL loses type safety; heavier ORMs add unnecessary abstraction for this scope. |
| Validation library | Zod | Joi, Yup, manual validation | Zod offers explicit schemas with first-class TypeScript integration and static type inference. Joi/Yup add an extra abstraction layer; manual validation is error-prone and inconsistent. |
| Testing framework | Vitest | Jest, Mocha | Vitest is fast, modern, and provides built-in coverage reporting. Jest is a valid alternative but slightly heavier; Mocha requires additional setup for assertions and mocking. |
| Application structure | Layered modular monolith | Microservices, event-driven, CQRS, hexagonal | A modular monolith provides sufficient separation of concerns without the operational and conceptual overhead of distributed architectures, which are unjustified for a single-resource CRUD API. |
| Reverse proxy | Apache | Nginx | Apache is already available on the existing Debian 13 VPS; using it avoids introducing and managing a new web server. |
| Process management | systemd | PM2, Docker | systemd is standard on Debian 13 and requires no additional runtime; PM2 and Docker add operational layers not needed for a single service. |

### 4.7 Dependencies and External Components

**Production dependencies:**

| Component | Purpose |
|-----------|---------|
| `express` | HTTP server and routing |
| `typescript` | Type-safe application development |
| `@prisma/client` | Typed database client |
| `zod` | Request and data validation |

**Development dependencies:**

| Component | Purpose |
|-----------|---------|
| `prisma` | Schema definition, migrations, and client generation |
| `vitest` | Automated testing and coverage reporting |
| `ts-node` / `tsx` | TypeScript execution during development |
| `nodemon` | Development server auto-restart |
| `@types/*` | TypeScript type definitions for Node.js and Express |

**External components and infrastructure:**

| Component | Purpose | Ownership |
|-----------|---------|-----------|
| PostgreSQL database | Persistent data storage | Dedicated database on Debian 13 VPS |
| Apache reverse proxy | HTTPS termination and request forwarding | Existing VPS infrastructure |
| systemd | Application process management | Debian 13 VPS |
| GitHub Actions | CI/CD automation | GitHub (free tier) |
| GitHub repository | Source control and public demonstration | Public GitHub repo |

---

## 5. Database and Migrations

### Database Configuration

Database engine: PostgreSQL. Connection configured via the `DATABASE_URL` environment variable. Connection settings are validated at application startup; an invalid or incomplete configuration causes a clear startup failure.

### Schema

Two tables:

- **users**: `id` (UUID PK), `name` (VARCHAR 200, required), `email` (VARCHAR 255, required, unique), `createdAt` (TIMESTAMP, required), `updatedAt` (TIMESTAMP, required).
- **tasks**: `id` (UUID PK), `title` (VARCHAR 200, required), `description` (TEXT, optional), `status` (ENUM: `PENDING`, `IN_PROGRESS`, `COMPLETED`, required), `responsibleId` (UUID, required, FK → `users.id`), `createdAt` (TIMESTAMP, required), `updatedAt` (TIMESTAMP, required).

### Migrations

Managed with Prisma. Schema maintained in `prisma/schema.prisma`.

- Generate migrations: `prisma migrate dev`
- Apply migrations (development): `prisma migrate dev`
- Apply migrations (production/deployment): `prisma migrate deploy`
- Migrations are applied in a controlled manner on the VPS during deployment; destructive database reset commands are never used as part of normal production deployment.

### Development and Test Databases

- **Development database:** Dedicated PostgreSQL database on the local environment.
- **Test database:** Isolated PostgreSQL test database, separate from development and production. Schema initialized via migrations. Test data is cleaned up between tests. Destructive operations never target the production database.

---

## 6. Testing Strategy

### 6.1 Testing Approach

Testing framework: **Vitest**. Three complementary test levels:

- **Unit tests:** isolated business rules, validation logic, service behavior with controlled dependencies.
- **Integration tests:** interactions between components — service/repository, Prisma database operations, constraints, persistence behavior.
- **API/HTTP tests:** actual API behavior through HTTP requests — CRUD operations, invalid request bodies, missing resources, invalid identifiers, filtering, pagination, correct HTTP status codes, error response structure.

Coverage target: **at least 90%** across the codebase, measured by Vitest coverage reporting.

### 6.2 Test Plan

Planned coverage includes:

- Unit tests: Zod validation schemas, service business logic.
- Integration tests: Prisma persistence, user/task creation and retrieval, email uniqueness constraint, foreign key relationship (`tasks.responsibleId → users.id`).
- API/HTTP tests: all eight endpoints (users: create/list/get; tasks: create/list/get/update/delete), filtering by `status` and `responsibleId`, pagination with defaults and limits, invalid inputs, missing resources (404), invalid UUIDs (400), correct status codes (200, 201, 204, 400, 404, 409, 500), error response structure.

### 6.3 Test Cases

Unit tests exist for every implementation unit and are run alongside integration and API tests before moving to the next unit, validating there are no regressions. Unit tests cover:

- Zod validation schemas (task creation, task updates, path parameters, filtering, pagination).
- Service business logic with controlled dependencies.

Integration and API/HTTP test cases:

| Scenario | Expected Result |
|----------|-----------------|
| Create valid task | 201, task returned with generated `id` and timestamps |
| Create task with missing title | 400, validation error |
| Create task with invalid `status` | 400, validation error |
| Create task with non-existent `responsibleId` | 400 or 404, FK violation handled |
| Get existing task | 200, task returned |
| Get non-existent task | 404 |
| Update task status via PATCH | 200, only `status` changed, `updatedAt` refreshed |
| Delete task | 204 |
| List tasks filtered by `status` | 200, only matching tasks returned |
| List tasks filtered by `responsibleId` | 200, only tasks for that user returned |
| Pagination `page`/`limit` defaults | 200, page 1, limit 10, metadata included |
| Pagination exceeding max page size | 400 |
| Invalid UUID in path parameter | 400 |
| Duplicate user email | 400 or 409, uniqueness enforced |

### 6.4 Running Tests

- Run full suite: `vitest --run`
- Run with coverage: `vitest --run --coverage`
- Run specific test file: `vitest run src/modules/tasks/task.service.test.ts`

### 6.5 Test Results

Last verified run (against the isolated `task_management_test` PostgreSQL database):

- Test files: 13 passed.
- Test cases: 128 passed, 0 failed.
- Command: `npm run test` (runs each test file sequentially against the isolated test database).
- Coverage (Vitest v8 provider): statements 50.17%, branches 96.36%, functions 92.86%, lines 50.17%. Statement/line coverage is below the ≥90% target and remains a gap to close.

Test database: isolated PostgreSQL test database, separate from development and production. Schema initialized via migrations. Test data cleaned up between tests. Destructive operations never target the production database.

Run relevant tests during implementation of each unit; run the complete suite at integration points and before merging to `master`.

---

## 7. Implementation Plan and Progress

### 7.1 Implementation Stages

| # | Branch | Unit | Scope | Expected Behavior | Acceptance Criteria | Tests | Commit Message |
|---|--------|------|-------|-------------------|---------------------|-------|----------------|
| 1 | `feature/project-init` | Project init | `package.json`, `tsconfig.json`, Prisma CLI, `.env.example`, `.gitignore`, src skeleton (`app.ts`, `server.ts`) | App compiles, starts, exposes health check | `tsc --noErrors` passes; server starts on `PORT` | None (scaffold) | `chore(project): initialize project` |
| 2 | `feature/test-setup` | Test setup | Vitest configuration, test database strategy, coverage config (≥90%), test cleanup helpers | Test suite runs in isolation against a dedicated test database | `vitest --run` executes; coverage report generated | Scaffold tests pass | `test(setup): configure Vitest and test database` |
| 3 | `feature/database-migrations` | Database schema & migrations | `prisma/schema.prisma` with `users` and `tasks` tables, initial migration | `prisma migrate dev` creates both tables with FK and indexes | Schema applies cleanly; tables exist with correct columns | Migration applies on fresh DB | `feat(database): define users and tasks schema` |
| 4 | `feature/user-repository` | User repository/service | `src/modules/users/user.repository.ts`, `user.service.ts` | CRUD users via Prisma; email uniqueness enforced | Create, list, get user; duplicate email rejected | Unit + integration tests | `feat(repository): implement user persistence` |
| 5 | `feature/task-repository` | Task repository/service | `src/modules/tasks/task.repository.ts`, `task.service.ts` | CRUD tasks; filter by status/responsibleId; pagination | Create, list (filtered/paginated), get, update, delete task | Unit + integration tests | `feat(repository): implement task persistence` |
| 6 | `feature/user-api` | User API routes/controllers | `src/modules/users/user.routes.ts`, `user.controller.ts` | `POST/GET/GET:id /users` with Zod validation | Endpoints return correct status codes and shapes | API/HTTP tests | `feat(api): implement user endpoints` |
| 7 | `feature/task-api` | Task API routes/controllers | `src/modules/tasks/task.routes.ts`, `task.controller.ts` | `POST/GET/GET:id/PATCH/DELETE /tasks` with Zod validation | Endpoints return correct status codes; filtering/pagination works | API/HTTP tests | `feat(api): implement task endpoints` |
| 8 | `feature/api-validation` | Validation | Zod schemas for all request bodies, params, queries | Invalid input rejected with 400 + structured error | All invalid inputs return 400 with `error.code` | Unit tests on schemas | `feat(validation): implement request validation` |
| 9 | `feature/api-error-handling` | Error handling middleware | `src/middleware/error-handler.ts`, `not-found.ts` | Centralized errors; consistent JSON structure; 404 for unknown routes | All error paths return `{ error: { code, message, details } }` | Unit + API tests | `fix(api): implement centralized error handling` |
| 10 | `feature/swagger-documentation` | OpenAPI/Swagger | Swagger UI config from implemented endpoints | Interactive docs at `/api-docs` | Docs match actual endpoints | None | `feat(docs): add Swagger API documentation` |

Tests are set up immediately after project init (unit 2). Each subsequent implementation unit includes its own tests, and the full suite is run before starting the next unit to validate there are no regressions.

### 7.2 Completed Milestones

| Stage | Unit | Functionality | Commit |
|-------|------|---------------|--------|
| 1 | Project init | `package.json`, `tsconfig.json`, Prisma CLI, `.env.example`, `.gitignore`, src skeleton (`app.ts`, `server.ts`), Prisma schema (`users` + `tasks`), health check endpoint (`GET /health`), CI/CD workflow fixes (`--ignore-scripts`, `prisma generate`), ESLint configuration | `chore(project): initialize project` |
| 2 | Test setup | Vitest configuration, test database strategy, coverage config (≥90%), test cleanup helpers, scaffold test | `test(setup): configure Vitest and test database` |
| 3 | Database schema & migrations | `prisma/schema.prisma` with `users` + `tasks` tables, `TaskStatus` enum, FK `tasks.responsibleId → users.id`, indexes on `([status, responsibleId, createdAt, id])` and `([responsibleId])`, initial migration `20261115_init_users_tasks` | `feat(database): define users and tasks schema` |
| 4 | User repository/service | `src/modules/users/user.repository.ts`, `user.service.ts` — CRUD users via Prisma; email uniqueness enforced; `NotFoundError`/`ConflictError` shared error classes | `feat(repository): implement user persistence` |
| 5 | Task repository/service | `src/modules/tasks/task.repository.ts`, `task.service.ts` — CRUD tasks; filter by status/responsibleId; pagination; validates responsible user exists | `feat(repository): implement task persistence` |
| 6 | User API routes/controllers | `src/modules/users/user.routes.ts`, `user.controller.ts` — `POST/GET/GET:id /users` with Zod validation; endpoints return correct status codes and shapes | `feat(api): implement user endpoints` |
| 7 | Task API routes/controllers | `src/modules/tasks/task.routes.ts`, `task.controller.ts` — `POST/GET/GET:id/PATCH/DELETE /tasks` with Zod validation; endpoints return correct status codes; filtering/pagination works | `feat(api): implement task endpoints` |
| 8 | Validation | Zod schemas for all request bodies, params, queries (`user.validation.ts`, `task.validation.ts`) | Invalid input rejected with 400 + structured `error.code` | All invalid inputs return 400 with `error.code` | Unit tests on schemas | `feat(validation): implement request validation` |
| 9 | Error handling middleware | `src/middleware/error-handler.ts`, `not-found.ts` | Centralized errors; consistent JSON structure; 404 for unknown routes | All error paths return `{ error: { code, message, details } }` | Unit + API tests | `fix(api): implement centralized error handling` |
| 10 | OpenAPI/Swagger documentation | `src/config/swagger.ts` OpenAPI spec; Swagger UI mounted at `/api-docs` and OpenAPI spec at `/api-docs.json`; docs cover all implemented users, tasks, and health endpoints with request/response schemas and status codes | Docs match actual endpoints | None | `feat(docs): add Swagger API documentation` |

### 7.3 Development Workflow

The project follows a feature-branch → Pull Request → code review → merge into `master` workflow. All development happens on feature branches named `feature/*`; direct commits and pushes to `master` are prohibited.

Local safeguards are stored in `.githooks/` and can be enabled with `git config core.hooksPath .githooks`:

- `pre-commit`: prevents local commits directly on `master`.
- `pre-push`: prevents direct pushes to `master`.

These are local safeguards, not a substitute for GitHub branch protection, and can be bypassed by a user with sufficient local control.

Continuous Integration runs on GitHub Actions for pushes to feature branches and for Pull Requests targeting `master`. CI checks include dependency installation (`npm ci`), TypeScript type checking (`tsc --noEmit`), linting (`eslint src`), automated tests (`vitest` run sequentially against the isolated test database), and production build verification (`npm run build`). A Pull Request is not eligible for merging if required checks fail.

Continuous Deployment runs automatically only on the push generated by merging a Pull Request into `master`. Deployment is triggered by PR merges into `master`, never by direct pushes to `master` or by Git tags/GitHub releases. The flow is:

`GitHub PR merge → push to master → GitHub Actions → SSH → Debian 13 VPS → Running API`

Each implementation unit is verified (relevant tests run, full suite before merging) and independently reviewed before its Pull Request is approved and merged.

---

## 8. Running the Application

### 8.1 Prerequisites

- Node.js (v20 or later) and npm.
- PostgreSQL (a running instance for development and for the isolated test database).

### 8.2 Installation

Clone the repository and install dependencies:

```
git clone <repository-url>
cd task_management_API
npm ci
```

### 8.3 Environment Configuration

Copy `.env.example` to `.env` and adjust the values for your environment. Never commit actual credentials or secrets.

```
cp .env.example .env
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://user:password@localhost:5432/task_management?schema=public` |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Application environment | `development` |

For tests, a separate `.env.test` file points at an isolated test database (`task_management_test`) on `PORT=3001`, `NODE_ENV=test`.

### 8.4 Database Setup

The schema and migrations are managed with Prisma in `prisma/schema.prisma`.

- Generate the Prisma client: `npm run prisma:generate`
- Create and apply migrations (development): `npm run prisma:migrate:dev`
- Apply migrations (production): `npm run prisma:migrate:deploy`

Ensure the target database exists before applying migrations.

### 8.5 Running the Application

Start the development server (TypeScript, with `ts-node`):

```
npm run dev
```

The API is then available at `http://localhost:3000` (or the configured `PORT`).

### 8.6 Building for Production

Compile TypeScript to `dist/`:

```
npm run build
```

Start the production server from the compiled output:

```
npm start
```

### 8.7 Running Tests

Run the full test suite (each test file sequentially against the isolated test database):

```
npm run test
```

Run with coverage reporting:

```
npm run test:coverage
```

Type checking and linting:

```
npm run typecheck
npm run lint
```

---

## 9. API Reference

### Base URL

Local: `http://localhost:3000` (port configurable via `PORT`).

Interactive API documentation is available through Swagger UI at `http://localhost:3000/api-docs`, with the raw OpenAPI 3.0 spec served at `http://localhost:3000/api-docs.json`. The documentation is generated from the implemented endpoints and kept synchronized with the actual API.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /users | Create a user |
| GET | /users | List users |
| GET | /users/:id | Retrieve a user |
| POST | /tasks | Create a task |
| GET | /tasks | List tasks with filtering and pagination |
| GET | /tasks/:id | Retrieve a task |
| PATCH | /tasks/:id | Partially update a task |
| DELETE | /tasks/:id | Delete a task |

### Filtering and Pagination

**Filtering:** `GET /tasks` supports two optional filters that can be combined:

| Query parameter | Type | Required | Description |
|-----------------|------|----------|-------------|
| `status` | `PENDING \| IN_PROGRESS \| COMPLETED` | No | Filter tasks by status. Exact, case-sensitive match. |
| `responsibleId` | UUID | No | Filter tasks by the responsible user. Invalid values return 400. |

Empty filter values are ignored. Invalid filter values return `400` with a structured validation error. Both filters can be combined:

```
GET /tasks?status=PENDING&responsibleId=<uuid>
```

**Pagination:** Offset-based pagination with deterministic ordering (`createdAt DESC`, `id` as tie-break).

```
GET /tasks?page=1&limit=10
```

| Query parameter | Default | Maximum | Description |
|-----------------|---------|---------|-------------|
| `page` | 1 | — | Page number (positive integer). |
| `limit` | 10 | 100 | Page size (positive integer). |

Invalid `page`/`limit` values return `400`. Pagination response metadata:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

**Indexes:** Filtered pagination is backed by a composite index on `tasks(status, responsibleId, createdAt, id)` and a separate index on `tasks(responsibleId)` for assignee filtering.

### API Documentation

Interactive API documentation is available through Swagger UI at `http://localhost:3000/api-docs`, with the raw OpenAPI 3.0 spec served at `http://localhost:3000/api-docs.json`. The documentation is generated from the implemented endpoints and kept synchronized with the actual API.

---

## 10. CI/CD and Deployment

### 10.1 Repository Workflow

Feature-branch → Pull Request → review → merge into `master` → automatic deployment.

All development happens on feature branches (`feature/*`). Direct commits and pushes to `master` are prohibited.

Local safeguards (development environment):

Hooks are stored in `.githooks/`. To enable them locally:

```
git config core.hooksPath .githooks
```

- `pre-commit`: prevents local commits directly on `master`.
- `pre-push`: prevents direct pushes to `master` (use via `git config core.hooksPath .githooks` or run manually before pushing).

These hooks are local safeguards, not a substitute for GitHub branch protection. They can be bypassed or omitted by a user with sufficient local control.

Pull Requests require independent review and passing CI checks before merging.

### 10.2 Continuous Integration

CI runs on GitHub Actions for:

- Pushes to feature branches.
- Pull Requests targeting `master`.

CI checks include:

- Dependency installation (`npm ci`).
- TypeScript type checking (`tsc --noEmit`).
- Linting (if configured).
- Automated tests (`vitest --run` with coverage).
- Production build verification (`npm run build`).

A Pull Request is not eligible for merging if required checks fail.

### 10.3 Continuous Deployment

Deployment occurs automatically only on the push generated by merging a Pull Request into `master`.

Deployment is triggered by Pull Request merges into `master`, not by direct pushes to `master` or by Git tags/GitHub releases.

The intended flow is:

`GitHub PR merge → push to master → GitHub Actions → SSH → Debian 13 VPS → Running API`

### 10.4 Deployment Architecture

Deployment uses GitHub Actions secrets to connect to the VPS via SSH:

- **Host:** `VPS_HOST`
- **Port:** `VPS_PORT`
- **User:** `VPS_USER`
- **SSH key:** `VPS_SSH_KEY`
- **Application directory:** `VPS_APP_DIR`
- **OS:** Debian 13
- **Node.js on VPS:** pre-installed

The CD workflow (`.github/workflows/cd.yml`) connects via SSH, pulls the latest `master`, installs production dependencies, and verifies the deployment. VPS-side application runtime (systemd service), PostgreSQL database, and Apache reverse proxy are deferred to Phase 7 and are not required for the initial file deployment.

### 10.5 VPS Configuration

Required GitHub Actions secrets (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP address or hostname |
| `VPS_PORT` | SSH port on the VPS |
| `VPS_USER` | Dedicated Linux deployment user |
| `VPS_SSH_KEY` | Private SSH key for VPS access |
| `VPS_APP_DIR` | Application directory on the VPS |

VPS state:

- Debian 13 with Node.js and npm pre-installed.
- Application directory exists, owned by the deployment user.
- PostgreSQL: not installed (deferred).
- Apache: installed but not configured for this app (deferred).
- systemd: reference service file exists (deferred).
- Firewall: custom iptables (deferred).

### 10.6 Deployment Verification

To verify deployment succeeded:

1. SSH into the VPS:
   ```
   ssh -p <VPS_PORT> <VPS_USER>@<VPS_HOST>
   ```
2. Confirm the application files are present:
   ```
   ls -la <VPS_APP_DIR>/
   ```
3. Confirm the checked-out branch is `master`:
   ```
   cd <VPS_APP_DIR> && git rev-parse --abbrev-ref HEAD
   ```
4. Confirm dependencies are installed:
   ```
   ls <VPS_APP_DIR>/node_modules/.package-lock.json
   ```

Application runtime verification (systemd service, health endpoint, PostgreSQL connectivity) is deferred to Phase 7.

---

## 11. Public Demonstration

**Public API:** TBD

**Swagger UI:** TBD

Explain the purpose and limitations of the demonstration environment.

Use fictitious data only.

Document any relevant restrictions or reset procedures.

---

## 12. Known Limitations

Actual limitations of the delivered implementation:

- Test statement/line coverage is approximately 50% (branches 96.36%, functions 92.86%), below the ≥90% target. Additional tests are needed to close the gap.
- No authentication or authorization; the API is openly accessible. This is a deliberate scope exclusion, not a defect.
- Offset-based pagination only; cursor-based pagination is not implemented.
- `PATCH` is used for partial updates; `PUT` (full resource replacement) is not implemented.
- Public demonstration is not yet live. VPS-side runtime (systemd service), PostgreSQL installation, Apache reverse-proxy configuration, and firewall setup are deferred (see Section 10).

Deliberate scope exclusions (not limitations/defects): authentication and authorization, microservices or distributed architecture, CQRS/event sourcing, paid services, and deployment triggered by Git tags or releases.

---

## 13. What I Would Improve With More Time

- **Authentication and authorization.** The API is openly accessible with no access control. Adding authentication would enable per-user task ownership, private task visibility, and authorization checks so users can only modify their own tasks.
- **Expanded testing.** Statement/line coverage is approximately 50%, below the ≥90% target. More unit, integration, and API tests — especially around edge cases, error paths, and the health endpoint — would close the gap and increase confidence in the implementation.
- **Additional API functionality.** Due dates, task categories, sorting, full-text search, and task assignment reassignment would make the API more useful beyond the current CRUD + filter + paginate scope.
- **Security hardening.** Rate limiting, request size limits, security headers (CSP, HSTS, X-Content-Type-Options), and stricter input sanitization would reduce exposure to abuse and common web attacks.
- **Monitoring and observability.** Structured request logging, error tracking, uptime monitoring, and alerting on the health endpoint would make the deployed service observable in production.
- **Deployment rollback.** The current CD flow deploys directly to the VPS with no rollback mechanism. A blue-green deployment or the ability to revert to a previous release would reduce downtime risk when a deployment breaks.
- **Scalability.** The single-VPS + PostgreSQL setup is appropriate for a public demonstration but not for production load. Horizontal scaling, read replicas, and connection pooling would be needed to scale beyond a small number of concurrent users.
- **Agentic development workflows.** Specialized AI agents for code review, test generation, and documentation could reduce manual effort, but they require careful human oversight and should not approve or merge their own work without independent review.

---

## 14. AI Usage and Development Methodology

## 14. AI Usage and Development Methodology

AI-assisted development was used throughout the project as an implementation assistant, not as an autonomous developer. The human developer retained authority over requirements, architecture, acceptance criteria, code review, testing, approval, and deployment decisions.

**AI tools and models used:**

- **Kilo extension on Visual Studio Code**, using model **Nemotron 3.5 Super VL (free)**: used for code generation, modification, implementation discussions, and debugging assistance.
- **ChatGPT**: used for general instructions and consulting on VPS configuration and deployment.

**What was AI-generated vs. human-written:**

- **AI-generated:** code implementation across modules (controllers, services, repositories, routes, validation schemas, middleware, Swagger configuration, tests), architecture decisions, and technical structure. All AI-generated code was reviewed and approved by the human developer before being accepted.
- **Human-written:** all Git interactions (commits, branches, Pull Requests, merges), architectural decision approval, requirements interpretation, test verification, code review, and deployment decisions. Git was not used autonomously by any AI tool.

**AI-assisted activities:**

- **Requirements analysis:** AI assisted in interpreting and clarifying the technical assessment requirements.
- **Architecture and implementation discussions:** AI helped define the layered modular monolith structure, technology stack choices (Express, PostgreSQL, Prisma, Zod, Vitest, OpenAPI/Swagger), and API endpoint design.
- **Code generation and modification:** AI generated the application code, tests, Swagger configuration, and supporting files across users and tasks modules.
- **Test generation and debugging assistance:** AI assisted in generating unit, integration, and API/HTTP tests and in debugging failures.
- **Human review and approval:** every AI-generated change was reviewed by the human developer before acceptance; no AI-generated change was committed, pushed, or merged without human approval.
- **Verification of generated code:** AI-generated code was validated through `tsc --noEmit` (type checking), `eslint src` (linting), and the full Vitest test suite against an isolated test database. Coverage results were recorded honestly, including gaps below the ≥90% target.

**Technical decision evaluation:** AI proposals were evaluated against project scope, maintainability, cost (free tools only), and proportionality to requirements. Distributed architectures, microservices, event-driven patterns, CQRS, and paid services were deliberately rejected as disproportionate to the scope. All technical decisions were ultimately made by the human developer.

The objective is to demonstrate responsible AI usage, not to claim that AI independently designed and implemented the application. AI was an implementation assistant; the human developer was the decision-maker, reviewer, and approver.

---

## 15. License

No license has been specified for this project. A license should be selected and added before public release, as the repository is intended to be public (enabling GitHub Free branch protection and a complete demonstration of the development workflow).
