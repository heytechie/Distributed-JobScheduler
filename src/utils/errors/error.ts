import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({
      message,
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super({
      message,
      statusCode: 409,
      code: "CONFLICT",
    });
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details?: unknown) {
    super({
      message,
      statusCode: 500,
      code: "DATABASE_ERROR",
      details,
    });
  }
}