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

Planning and requirements analysis complete. No implementation code exists yet. Technology stack and architecture decisions are pending developer approval.

Do not leave temporary development notes in the final version.

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
- User management.
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
│
├── config/
│   └── env.ts
│
├── modules/
│   └── tasks/
│       ├── task.routes.ts
│       ├── task.controller.ts
│       ├── task.service.ts
│       ├── task.repository.ts
│       ├── task.validation.ts
│       └── task.types.ts
│
├── database/
│   └── prisma.ts
│
├── middleware/
│   ├── error-handler.ts
│   └── not-found.ts
│
└── shared/
    └── errors/
```

Component responsibilities:

| Component | Responsibility |
|-----------|----------------|
| `app.ts` | Creates and configures the Express application |
| `server.ts` | Starts the HTTP server |
| `config/` | Application configuration and environment validation |
| `routes` | Defines API endpoints and connects them to controllers |
| `controllers` | Handles HTTP requests and constructs HTTP responses (no business logic) |
| `services` | Implements business rules (no Express-specific dependencies) |
| `repositories` | Encapsulates database access via Prisma |
| `validation` | Defines Zod request validation schemas |
| `database/` | Provides Prisma client configuration |
| `middleware/` | Centralized error handling and shared HTTP concerns |
| `shared/` | Genuinely reusable application components |

### 4.3 Data Model

To be defined in Phase 3.

### 4.4 API Design

To be defined in Phase 3.

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

Explain the database engine and connection configuration.

### Schema

Describe the database schema.

### Migrations

Explain how migrations are created, applied, and managed.

Include the commands required to initialize a new database.

### Development and Test Databases

Explain how database environments are separated and how tests avoid modifying development data.

---

## 6. Testing Strategy

### 6.1 Testing Approach

Describe the testing framework and the testing levels used.

### 6.2 Test Plan

Summarize the planned test coverage, including:

- Unit tests.
- Integration tests.
- API/HTTP tests.

### 6.3 Test Cases

List the important test scenarios and expected results.

### 6.4 Running Tests

Provide the commands needed to execute the test suite.

### 6.5 Test Results

Summarize the verified results of the final test run.

Do not claim test coverage or successful execution unless it has actually been verified.

---

## 7. Implementation Plan and Progress

### 7.1 Implementation Stages

Summarize the major implementation stages.

### 7.2 Completed Milestones

List completed milestones and the corresponding functionality.

### 7.3 Development Workflow

Explain the feature-branch and Pull Request workflow.

Describe the role of CI checks and code review.

This section should summarize the actual workflow, not reproduce every individual commit.

---

## 8. Running the Application

### 8.1 Prerequisites

List required software and supported versions.

### 8.2 Installation

Provide the commands to clone the repository and install dependencies.

### 8.3 Environment Configuration

Document required environment variables.

Include an `.env.example` reference.

Never include actual credentials or secrets.

### 8.4 Database Setup

Explain how to create and initialize the database and apply migrations.

### 8.5 Running the Application

Provide the command to start the development server.

### 8.6 Building for Production

Explain how to compile and prepare the application for production.

### 8.7 Running Tests

Provide the relevant testing commands.

---

## 9. API Reference

### Base URL

Document the local and public demonstration URLs.

### Endpoints

Provide an endpoint table.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /tasks | Create a task |
| GET | /tasks | List tasks |
| GET | /tasks/:id | Retrieve a task |
| PUT/PATCH | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

The final endpoint design must reflect the implemented API.

### Filtering and Pagination

Document supported filters, query parameters, defaults, and limits.

### API Documentation

Provide the Swagger UI / OpenAPI URL when available.

---

## 10. CI/CD and Deployment

### 10.1 Repository Workflow

Explain the feature-branch → Pull Request → review → merge workflow.

### 10.2 Continuous Integration

Describe the GitHub Actions checks executed for feature branches and Pull Requests.

### 10.3 Continuous Deployment

Explain how changes merged into `master` trigger deployment.

Clarify that deployment is triggered by updates to `master`, not by Git tags.

### 10.4 Deployment Architecture

Describe the GitHub Actions-to-VPS deployment process.

### 10.5 VPS Configuration

Document the relevant infrastructure configuration without exposing secrets.

### 10.6 Deployment Verification

Explain how to verify that a deployment completed successfully and the application is healthy.

---

## 11. Public Demonstration

**Public API:** TBD

**Swagger UI:** TBD

Explain the purpose and limitations of the demonstration environment.

Use fictitious data only.

Document any relevant restrictions or reset procedures.

---

## 12. Known Limitations

List actual limitations of the delivered implementation.

Distinguish deliberate scope exclusions from defects or unfinished work.

---

## 13. What I Would Improve With More Time

Discuss realistic future improvements.

Possible topics include:

- Authentication and authorization.
- Expanded testing.
- Additional API functionality.
- Security hardening.
- Monitoring and observability.
- Deployment rollback.
- Scalability.
- Agentic development workflows.

Explain why each improvement would be valuable.

---

## 14. AI Usage and Development Methodology

Explain how AI-assisted development was used throughout the project.

Include:

- AI-assisted requirements analysis.
- Architecture and implementation discussions.
- Code generation and modification.
- Test generation and debugging assistance.
- Human review and approval.
- Verification of generated code.

Explain how technical decisions were evaluated and how AI-generated changes were validated.

The objective is to demonstrate responsible AI usage, not to claim that AI independently designed and implemented the application.

---

## 15. License

Specify the project's license, if applicable.
