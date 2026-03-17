import { z } from 'zod';
/** Type of uploaded document */
export declare enum DocumentType {
    TAX_RETURN = "TAX_RETURN",
    FORM_1099 = "FORM_1099",
    BANK_STATEMENT = "BANK_STATEMENT",
    PROFIT_LOSS = "PROFIT_LOSS",
    OTHER = "OTHER"
}
/** Document verification status */
export declare enum DocumentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
/** Uploaded document record */
export interface Document {
    id: string;
    borrower_id: string;
    document_type: DocumentType;
    s3_key: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    encrypted: boolean;
    status: DocumentStatus;
    verification_notes?: string;
    uploaded_at: string;
    verified_at?: string;
}
/** Zod schema for Document */
export declare const DocumentSchema: z.ZodObject<{
    id: z.ZodString;
    borrower_id: z.ZodString;
    document_type: z.ZodNativeEnum<typeof DocumentType>;
    s3_key: z.ZodString;
    filename: z.ZodString;
    mime_type: z.ZodString;
    size_bytes: z.ZodNumber;
    encrypted: z.ZodBoolean;
    status: z.ZodNativeEnum<typeof DocumentStatus>;
    verification_notes: z.ZodOptional<z.ZodString>;
    uploaded_at: z.ZodString;
    verified_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: DocumentStatus;
    borrower_id: string;
    document_type: DocumentType;
    s3_key: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    encrypted: boolean;
    uploaded_at: string;
    verification_notes?: string | undefined;
    verified_at?: string | undefined;
}, {
    id: string;
    status: DocumentStatus;
    borrower_id: string;
    document_type: DocumentType;
    s3_key: string;
    filename: string;
    mime_type: string;
    size_bytes: number;
    encrypted: boolean;
    uploaded_at: string;
    verification_notes?: string | undefined;
    verified_at?: string | undefined;
}>;
/** Zod schema for document upload request */
export declare const UploadDocumentSchema: z.ZodObject<{
    document_type: z.ZodNativeEnum<typeof DocumentType>;
    filename: z.ZodString;
    mime_type: z.ZodString;
    size_bytes: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    document_type: DocumentType;
    filename: string;
    mime_type: string;
    size_bytes: number;
}, {
    document_type: DocumentType;
    filename: string;
    mime_type: string;
    size_bytes: number;
}>;
//# sourceMappingURL=document.d.ts.map