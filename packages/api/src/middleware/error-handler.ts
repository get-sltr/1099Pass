import { APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from 'aws-lambda';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export function handleError(error: unknown): APIGatewayProxyResult {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { code: error.code, message: error.message } }),
    };
  }

  console.error('Unhandled error:', error);
  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }),
  };
}

/**
 * Error handler for use within handlers (non-wrapper version)
 * Returns a properly formatted API response with request ID
 */
export function errorHandler(error: Error, requestId: string): APIGatewayProxyResult {
  const headers = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
  };

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      headers,
      body: JSON.stringify({
        error: { code: error.code, message: error.message },
        requestId,
      }),
    };
  }

  console.error('Unhandled error:', error, 'requestId:', requestId);
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      requestId,
    }),
  };
}

type HandlerFn = (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;

export function withErrorHandler(handler: HandlerFn): APIGatewayProxyHandler {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
