export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code : string;
    public readonly details?: unknown;

     constructor({
    message,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    isOperational = true,
    details,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    isOperational?: boolean;
    details?: unknown;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;
    
    
    Error.captureStackTrace(this, this.constructor);
  }

}