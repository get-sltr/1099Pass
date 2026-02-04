/**
 * Request Logging Middleware
 * Provides comprehensive request/response logging for API observability
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * Fields to redact from logs for security
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'x-api-key',
  'secret',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'id_token',
  'ssn',
  'social_security',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
];

/**
 * Headers to redact
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-amz-security-token',
];

/**
 * Redact sensitive data from an object
 */
function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitive(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Redact sensitive headers
 */
function redactHeaders(
  headers: Record<string, string | undefined> | null
): Record<string, string> {
  if (!headers) return {};

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value || '';
    }
  }

  return result;
}

/**
 * Extract user info from event for logging
 */
function extractUserInfo(event: APIGatewayProxyEvent): Record<string, string> {
  const claims = event.requestContext?.authorizer?.claims;
  return {
    userId: claims?.sub || 'anonymous',
    userType: claims?.['custom:user_type'] || 'unknown',
    email: claims?.email ? '[present]' : '[absent]',
  };
}

/**
 * Log levels
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured log entry
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId: string;
  correlationId?: string;
  traceId?: string;
  service: string;
  environment: string;
  message: string;
  data?: Record<string, unknown>;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Create a structured log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context: {
    requestId: string;
    correlationId?: string;
    traceId?: string;
  },
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    requestId: context.requestId,
    correlationId: context.correlationId,
    traceId: context.traceId,
    service: '1099pass-api',
    environment: process.env.ENVIRONMENT || 'dev',
    message,
    data,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Output log entry
 */
function log(entry: LogEntry): void {
  const output = JSON.stringify(entry);

  switch (entry.level) {
    case 'error':
      console.error(output);
      break;
    case 'warn':
      console.warn(output);
      break;
    case 'debug':
      if (process.env.LOG_LEVEL === 'debug') {
        console.debug(output);
      }
      break;
    default:
      console.info(output);
  }
}

/**
 * Request logging context
 */
export interface RequestLogContext {
  requestId: string;
  correlationId?: string;
  traceId?: string;
  startTime: number;
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, data?: Record<string, unknown>) => void;
}

/**
 * Create request log context
 */
export function createRequestLogContext(
  event: APIGatewayProxyEvent,
  context: Context
): RequestLogContext {
  const requestId = event.requestContext?.requestId || context.awsRequestId;
  const correlationId = event.headers?.['x-correlation-id'];
  const traceId = event.headers?.['x-amzn-trace-id'];

  const logContext = { requestId, correlationId, traceId };

  return {
    requestId,
    correlationId,
    traceId,
    startTime: Date.now(),
    debug: (message, data) =>
      log(createLogEntry('debug', message, logContext, data)),
    info: (message, data) =>
      log(createLogEntry('info', message, logContext, data)),
    warn: (message, data) =>
      log(createLogEntry('warn', message, logContext, data)),
    error: (message, error, data) =>
      log(createLogEntry('error', message, logContext, data, error)),
  };
}

/**
 * Log request details
 */
export function logRequest(
  event: APIGatewayProxyEvent,
  logCtx: RequestLogContext
): void {
  const body = event.body ? JSON.parse(event.body) : null;

  logCtx.info('API Request', {
    method: event.httpMethod,
    path: event.path,
    resource: event.resource,
    queryParams: event.queryStringParameters || {},
    pathParams: event.pathParameters || {},
    headers: redactHeaders(event.headers),
    body: body ? redactSensitive(body) : null,
    user: extractUserInfo(event),
    sourceIp: event.requestContext?.identity?.sourceIp,
    userAgent: event.requestContext?.identity?.userAgent,
  });
}

/**
 * Log response details
 */
export function logResponse(
  response: APIGatewayProxyResult,
  logCtx: RequestLogContext
): void {
  const duration = Date.now() - logCtx.startTime;

  const level: LogLevel =
    response.statusCode >= 500
      ? 'error'
      : response.statusCode >= 400
        ? 'warn'
        : 'info';

  const entry = createLogEntry(
    level,
    'API Response',
    {
      requestId: logCtx.requestId,
      correlationId: logCtx.correlationId,
      traceId: logCtx.traceId,
    },
    {
      statusCode: response.statusCode,
      headers: response.headers || {},
      bodyLength: response.body?.length || 0,
    }
  );

  entry.duration = duration;
  log(entry);
}

/**
 * Higher-order function that wraps a handler with request/response logging
 */
export function withRequestLogging<
  T extends (
    event: APIGatewayProxyEvent,
    context: Context
  ) => Promise<APIGatewayProxyResult>,
>(handler: T): T {
  return (async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    const logCtx = createRequestLogContext(event, context);

    logRequest(event, logCtx);

    try {
      const response = await handler(event, context);
      logResponse(response, logCtx);
      return response;
    } catch (error) {
      logCtx.error('Unhandled error', error as Error);
      throw error;
    }
  }) as T;
}
