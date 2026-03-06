/**
 * AI Document Analyzer — Extract data from tax/1099/bank docs (Haiku/Vision)
 */

import { askClaude } from './ai-service';

export type DocumentType =
  | 'TAX_RETURN'
  | '1099_FORM'
  | 'BANK_STATEMENT'
  | 'PROFIT_LOSS';

export interface DocumentExtraction {
  [key: string]: unknown;
  error?: string;
}

/**
 * Analyze an uploaded document image and extract structured data.
 * Caller must confirm extracted data before it affects financial profile.
 * Note: Vision input (imageBase64) not yet wired to Bedrock; currently text-only prompt.
 */
export async function analyzeUploadedDocument(
  _imageBase64: string,
  documentType: DocumentType
): Promise<DocumentExtraction> {
  const typeLabel = documentType.replace(/_/g, ' ');

  const prompt = `Analyze this ${typeLabel} document image. Extract:

For 1099_FORM:
- Payer name, Payer TIN (REDACT — return "***"), Recipient name
- Box amounts (nonemployee compensation, rents, royalties, etc.)
- Tax year

For TAX_RETURN:
- Filing status, tax year
- Total income (line 9 on 1040), AGI (line 11)
- Schedule C net profit/loss if present
- Schedule SE self-employment tax if present

For BANK_STATEMENT:
- Institution name, statement period
- Total deposits, total withdrawals
- Ending balance
- Identified income deposits (list top recurring ones)

For PROFIT_LOSS:
- Business name, period
- Total revenue, total expenses, net income

Return valid JSON only. For any TIN/SSN/account numbers, use value "REDACTED".
If the image is unclear or not the expected document type, return { "error": "description" }.`;

  // Note: For vision, Bedrock Converse API or model-specific image input would be used.
  // This stub uses text-only; when adding vision, pass image in the message content.
  const raw = await askClaude(prompt, {
    tier: 'fast',
    maxTokens: 2048,
  });

  const trimmed = raw.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}');
  return JSON.parse(trimmed) as DocumentExtraction;
}

/**
 * Analyze document from base64 image (for when vision is wired).
 * Placeholder: same as above until Bedrock vision payload is added.
 */
export async function analyzeDocumentImage(
  imageBase64: string,
  documentType: DocumentType
): Promise<DocumentExtraction> {
  return analyzeUploadedDocument(imageBase64, documentType);
}
