/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS, injection attacks, and other security issues
 */

import { z } from 'zod';

/**
 * HTML entities that should be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML entities in a string
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove control characters (except newlines and tabs for text fields)
 */
export function removeControlChars(
  input: string,
  allowNewlines = false
): string {
  if (allowNewlines) {
    // eslint-disable-next-line no-control-regex
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Normalize unicode to prevent homograph attacks
 */
export function normalizeUnicode(input: string): string {
  return input.normalize('NFKC');
}

/**
 * Remove null bytes (common injection technique)
 */
export function removeNullBytes(input: string): string {
  return input.replace(/\0/g, '');
}

/**
 * Trim and collapse whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize a string for safe storage and display
 */
export function sanitizeString(
  input: string,
  options: {
    escapeHtml?: boolean;
    allowNewlines?: boolean;
    maxLength?: number;
    trim?: boolean;
  } = {}
): string {
  const {
    escapeHtml: shouldEscapeHtml = true,
    allowNewlines = false,
    maxLength = 10000,
    trim = true,
  } = options;

  let result = input;

  // Remove null bytes first
  result = removeNullBytes(result);

  // Normalize unicode
  result = normalizeUnicode(result);

  // Remove control characters
  result = removeControlChars(result, allowNewlines);

  // Trim if requested
  if (trim) {
    result = result.trim();
  }

  // Escape HTML if requested
  if (shouldEscapeHtml) {
    result = escapeHtml(result);
  }

  // Truncate to max length
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  return input.toLowerCase().trim().slice(0, 254);
}

/**
 * Sanitize phone number (keep only digits and leading +)
 */
export function sanitizePhone(input: string): string {
  const cleaned = input.replace(/[^\d+]/g, '');
  // Ensure + only appears at the start
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/\+/g, '').slice(0, 14);
  }
  return cleaned.slice(0, 15);
}

/**
 * Sanitize a URL (basic validation and normalization)
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    // Only allow http and https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize UUID
 */
export function sanitizeUuid(input: string): string | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const normalized = input.toLowerCase().trim();
  return uuidRegex.test(normalized) ? normalized : null;
}

/**
 * Sanitize numeric string
 */
export function sanitizeNumeric(input: string): string {
  return input.replace(/[^\d.-]/g, '');
}

/**
 * Sanitize alphanumeric string
 */
export function sanitizeAlphanumeric(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Deep sanitize an object recursively
 */
export function deepSanitize<T>(
  obj: T,
  options: {
    escapeHtml?: boolean;
    allowNewlinesInFields?: string[];
    maxStringLength?: number;
  } = {}
): T {
  const {
    escapeHtml: shouldEscapeHtml = true,
    allowNewlinesInFields = ['body', 'content', 'description', 'notes'],
    maxStringLength = 10000,
  } = options;

  function sanitizeValue(value: unknown, key?: string): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      const allowNewlines = key ? allowNewlinesInFields.includes(key) : false;
      return sanitizeString(value, {
        escapeHtml: shouldEscapeHtml,
        allowNewlines,
        maxLength: maxStringLength,
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        result[k] = sanitizeValue(v, k);
      }
      return result;
    }

    return value;
  }

  return sanitizeValue(obj) as T;
}

/**
 * Create a sanitized Zod schema wrapper
 */
export function sanitizedString(
  options: {
    minLength?: number;
    maxLength?: number;
    allowNewlines?: boolean;
  } = {}
) {
  const { minLength = 1, maxLength = 1000, allowNewlines = false } = options;

  return z.string().transform((val) =>
    sanitizeString(val, {
      escapeHtml: true,
      allowNewlines,
      maxLength,
    })
  ).pipe(z.string().min(minLength).max(maxLength));
}

/**
 * Validate and sanitize request body
 */
export function sanitizeRequestBody<T>(
  body: string | null,
  options: {
    escapeHtml?: boolean;
    allowNewlinesInFields?: string[];
  } = {}
): T | null {
  if (!body) {
    return null;
  }

  try {
    const parsed = JSON.parse(body);
    return deepSanitize(parsed, options);
  } catch {
    return null;
  }
}

/**
 * SQL-safe string (for logging only - always use parameterized queries!)
 */
export function sqlSafe(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}
