import type { ApiErrorEnvelope } from '@stockan/shared';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PROVIDER_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED'
  | 'INSUFFICIENT_DATA'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: { code: string; message: string; field?: string }[];

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: { code: string; message: string; field?: string }[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toEnvelope(requestId: string): ApiErrorEnvelope {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: { code: string; message: string; field?: string }[]) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(
      404,
      'NOT_FOUND',
      identifier ? `${resource} '${identifier}' not found.` : `${resource} not found.`
    );
  }
}

export class ProviderError extends AppError {
  constructor(provider: string, message: string) {
    super(502, 'PROVIDER_ERROR', `Provider '${provider}' error: ${message}`);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized access.') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class InsufficientDataError extends AppError {
  constructor(message: string = 'Insufficient historical or financial data to compute metrics.') {
    super(422, 'INSUFFICIENT_DATA', message);
  }
}
