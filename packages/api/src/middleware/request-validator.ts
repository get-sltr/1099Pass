import { z, ZodSchema } from 'zod';
import { ValidationError } from './error-handler';

export function validateBody<T>(schema: ZodSchema<T>, body: string | null): T {
  if (!body) throw new ValidationError('Request body is required');

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new ValidationError(messages);
  }

  return result.data;
}

export function validatePathParams<T>(schema: ZodSchema<T>, params: Record<string, string | undefined> | null): T {
  const result = schema.safeParse(params ?? {});
  if (!result.success) {
    const messages = result.error.errors.map(e => e.message).join(', ');
    throw new ValidationError(messages);
  }
  return result.data;
}

export function validateQueryParams<T>(schema: ZodSchema<T>, params: Record<string, string | undefined> | null): T {
  const result = schema.safeParse(params ?? {});
  if (!result.success) {
    const messages = result.error.errors.map(e => e.message).join(', ');
    throw new ValidationError(messages);
  }
  return result.data;
}
