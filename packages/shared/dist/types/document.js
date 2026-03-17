"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadDocumentSchema = exports.DocumentSchema = exports.DocumentStatus = exports.DocumentType = void 0;
const zod_1 = require("zod");
/** Type of uploaded document */
var DocumentType;
(function (DocumentType) {
    DocumentType["TAX_RETURN"] = "TAX_RETURN";
    DocumentType["FORM_1099"] = "FORM_1099";
    DocumentType["BANK_STATEMENT"] = "BANK_STATEMENT";
    DocumentType["PROFIT_LOSS"] = "PROFIT_LOSS";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
/** Document verification status */
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["PROCESSING"] = "PROCESSING";
    DocumentStatus["VERIFIED"] = "VERIFIED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
/** Zod schema for Document */
exports.DocumentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    borrower_id: zod_1.z.string().uuid(),
    document_type: zod_1.z.nativeEnum(DocumentType),
    s3_key: zod_1.z.string().min(1),
    filename: zod_1.z.string().min(1).max(255),
    mime_type: zod_1.z.string().min(1),
    size_bytes: zod_1.z.number().int().min(0),
    encrypted: zod_1.z.boolean(),
    status: zod_1.z.nativeEnum(DocumentStatus),
    verification_notes: zod_1.z.string().max(1000).optional(),
    uploaded_at: zod_1.z.string().datetime(),
    verified_at: zod_1.z.string().datetime().optional(),
});
/** Zod schema for document upload request */
exports.UploadDocumentSchema = zod_1.z.object({
    document_type: zod_1.z.nativeEnum(DocumentType),
    filename: zod_1.z.string().min(1).max(255),
    mime_type: zod_1.z.string().min(1),
    size_bytes: zod_1.z.number().int().min(1).max(52428800), // 50MB max
});
//# sourceMappingURL=document.js.map