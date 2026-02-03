import { z, ZodSchema, ZodError } from 'zod';

/** Sort order for pagination */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: SortOrder;
}

/** Result of safe validation */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{ path: string; message: string }>;
}

/** Validate data against a Zod schema, throw on failure */
export function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/** Validate data safely without throwing */
export function safeValidate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

/** Create a Zod schema for pagination parameters */
export function createPaginationSchema(defaultLimit = 20, maxLimit = 100) {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
    sort_by: z.string().optional(),
    sort_order: z.nativeEnum(SortOrder).optional(),
  });
}

/** UUID regex */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Check if string is valid UUID */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/** Check if string is valid email */
export function isValidEmail(value: string): boolean {
  return z.string().email().safeParse(value).success;
}

/** Check if string is valid E.164 phone */
export function isValidPhone(value: string): boolean {
  return /^\+?[1-9]\d{1,14}$/.test(value);
}

/** Extract user-friendly messages from ZodError */
export function getZodErrorMessages(error: ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/** Format ZodError as field-keyed object for API responses */
export function formatValidationErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.') || '_root';
    if (!formatted[path]) formatted[path] = [];
    formatted[path].push(err.message);
  });
  return formatted;
}
