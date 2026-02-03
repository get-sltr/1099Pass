import { z } from 'zod';

/** Type of uploaded document */
export enum DocumentType {
  TAX_RETURN = 'TAX_RETURN',
  FORM_1099 = 'FORM_1099',
  BANK_STATEMENT = 'BANK_STATEMENT',
  PROFIT_LOSS = 'PROFIT_LOSS',
  OTHER = 'OTHER',
}

/** Document verification status */
export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
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
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  borrower_id: z.string().uuid(),
  document_type: z.nativeEnum(DocumentType),
  s3_key: z.string().min(1),
  filename: z.string().min(1).max(255),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().min(0),
  encrypted: z.boolean(),
  status: z.nativeEnum(DocumentStatus),
  verification_notes: z.string().max(1000).optional(),
  uploaded_at: z.string().datetime(),
  verified_at: z.string().datetime().optional(),
});

/** Zod schema for document upload request */
export const UploadDocumentSchema = z.object({
  document_type: z.nativeEnum(DocumentType),
  filename: z.string().min(1).max(255),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().min(1).max(52428800), // 50MB max
});
