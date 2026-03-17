"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID_REGEX = exports.SortOrder = void 0;
exports.validateOrThrow = validateOrThrow;
exports.safeValidate = safeValidate;
exports.createPaginationSchema = createPaginationSchema;
exports.isValidUUID = isValidUUID;
exports.isValidEmail = isValidEmail;
exports.isValidPhone = isValidPhone;
exports.getZodErrorMessages = getZodErrorMessages;
exports.formatValidationErrors = formatValidationErrors;
const zod_1 = require("zod");
/** Sort order for pagination */
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
/** Validate data against a Zod schema, throw on failure */
function validateOrThrow(schema, data) {
    return schema.parse(data);
}
/** Validate data safely without throwing */
function safeValidate(schema, data) {
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
function createPaginationSchema(defaultLimit = 20, maxLimit = 100) {
    return zod_1.z.object({
        page: zod_1.z.coerce.number().int().min(1).default(1),
        limit: zod_1.z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
        sort_by: zod_1.z.string().optional(),
        sort_order: zod_1.z.nativeEnum(SortOrder).optional(),
    });
}
/** UUID regex */
exports.UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Check if string is valid UUID */
function isValidUUID(value) {
    return exports.UUID_REGEX.test(value);
}
/** Check if string is valid email */
function isValidEmail(value) {
    return zod_1.z.string().email().safeParse(value).success;
}
/** Check if string is valid E.164 phone */
function isValidPhone(value) {
    return /^\+?[1-9]\d{1,14}$/.test(value);
}
/** Extract user-friendly messages from ZodError */
function getZodErrorMessages(error) {
    return error.errors.map((err) => {
        const path = err.path.join('.');
        return path ? `${path}: ${err.message}` : err.message;
    });
}
/** Format ZodError as field-keyed object for API responses */
function formatValidationErrors(error) {
    const formatted = {};
    error.errors.forEach((err) => {
        const path = err.path.join('.') || '_root';
        if (!formatted[path])
            formatted[path] = [];
        formatted[path].push(err.message);
    });
    return formatted;
}
//# sourceMappingURL=validation.js.map