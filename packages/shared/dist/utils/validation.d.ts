import { z, ZodSchema, ZodError } from 'zod';
/** Sort order for pagination */
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
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
    errors?: Array<{
        path: string;
        message: string;
    }>;
}
/** Validate data against a Zod schema, throw on failure */
export declare function validateOrThrow<T>(schema: ZodSchema<T>, data: unknown): T;
/** Validate data safely without throwing */
export declare function safeValidate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T>;
/** Create a Zod schema for pagination parameters */
export declare function createPaginationSchema(defaultLimit?: number, maxLimit?: number): z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort_by: z.ZodOptional<z.ZodString>;
    sort_order: z.ZodOptional<z.ZodNativeEnum<typeof SortOrder>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sort_by?: string | undefined;
    sort_order?: SortOrder | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sort_by?: string | undefined;
    sort_order?: SortOrder | undefined;
}>;
/** UUID regex */
export declare const UUID_REGEX: RegExp;
/** Check if string is valid UUID */
export declare function isValidUUID(value: string): boolean;
/** Check if string is valid email */
export declare function isValidEmail(value: string): boolean;
/** Check if string is valid E.164 phone */
export declare function isValidPhone(value: string): boolean;
/** Extract user-friendly messages from ZodError */
export declare function getZodErrorMessages(error: ZodError): string[];
/** Format ZodError as field-keyed object for API responses */
export declare function formatValidationErrors(error: ZodError): Record<string, string[]>;
//# sourceMappingURL=validation.d.ts.map