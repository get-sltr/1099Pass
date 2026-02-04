/**
 * Security Headers Middleware
 * Adds security-related HTTP headers to all API responses
 */

import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Standard security headers for API responses
 */
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',

  // Strict Transport Security (1 year)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Prevent caching of sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
  Expires: '0',

  // Content Security Policy for API (strict)
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy':
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
};

/**
 * Add security headers to an API Gateway response
 */
export function addSecurityHeaders(
  response: APIGatewayProxyResult
): APIGatewayProxyResult {
  return {
    ...response,
    headers: {
      ...SECURITY_HEADERS,
      ...response.headers,
    },
  };
}

/**
 * Higher-order function that wraps a handler to add security headers
 */
export function withSecurityHeaders<T extends (...args: unknown[]) => Promise<APIGatewayProxyResult>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<APIGatewayProxyResult> => {
    const response = await handler(...args);
    return addSecurityHeaders(response);
  }) as T;
}

/**
 * Create CORS headers for specific allowed origins
 */
export function createCorsHeaders(
  allowedOrigins: string[],
  requestOrigin?: string
): Record<string, string> {
  // Check if request origin is allowed
  const origin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0] || '*';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Request-Id',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Environment-specific allowed origins
 */
export function getAllowedOrigins(): string[] {
  const env = process.env.ENVIRONMENT || 'dev';

  switch (env) {
    case 'prod':
      return [
        'https://1099pass.com',
        'https://www.1099pass.com',
        'https://lender.1099pass.com',
        'https://api.1099pass.com',
      ];
    case 'staging':
      return [
        'https://staging.1099pass.com',
        'https://lender.staging.1099pass.com',
        'https://api.staging.1099pass.com',
      ];
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'https://dev.1099pass.com',
      ];
  }
}
