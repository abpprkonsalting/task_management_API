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

Document the technologies actually selected and used.

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js | Application runtime |
| Language | TypeScript | Application development |
| Framework | TBD | HTTP server and routing |
| Database | TBD | Persistent storage |
| ORM | TBD | Database access and migrations |
| Validation | TBD | Request validation |
| Testing | TBD | Automated tests |
| API documentation | TBD | OpenAPI/Swagger |
| CI/CD | GitHub Actions | Automated verification and deployment |
| Hosting | Debian 13 VPS | Public demonstration |

Include relevant version information where useful.

---

## 4. Architecture and Design Decisions

### 4.1 Application Architecture

Explain the selected architectural approach and the responsibilities of the main application layers.

### 4.2 Project Structure

Document the directory structure and explain the purpose of its important directories and modules.

### 4.3 Data Model

Describe the Task entity, its attributes, constraints, and relationships.

Include an ER diagram if appropriate.

### 4.4 API Design

Document:

- Available endpoints.
- HTTP methods.
- URL parameters.
- Query parameters.
- Request schemas.
- Response schemas.
- HTTP status codes.

Include representative request and response examples.

### 4.5 Validation and Error Handling

Explain the validation strategy and the format used for error responses.

### 4.6 Architectural Decisions

Record significant technical decisions and their rationale.

Prefer concise explanations of why a particular approach was selected over reasonable alternatives.

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
