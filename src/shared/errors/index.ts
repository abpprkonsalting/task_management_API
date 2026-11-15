export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(message: string, statusCode: number, code: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, 404, 'NOT_FOUND', [{ resource, id }]);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown[] = []) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
