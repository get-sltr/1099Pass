/**
 * POST /ai/analyze-document
 * Extract structured data from uploaded document image (Cognito, borrower only)
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import * as borrowerRepository from '../../db/repositories/borrower-repository';
import { analyzeDocumentImage } from '../../services/ai-document-analyzer';
import { validateRequest } from '../../middleware/request-validator';
import { withErrorHandler } from '../../middleware/error-handler';
import { requireRole, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';

const RequestSchema = z.object({
  documentType: z.enum(['TAX_RETURN', '1099_FORM', 'BANK_STATEMENT', 'PROFIT_LOSS']),
  imageBase64: z.string().min(1),
});

async function handleAnalyzeDocument(
  event: AuthenticatedEvent,
  _context: unknown
): Promise<APIGatewayProxyResult> {
  const { body, user, requestId } = event;

  const validation = validateRequest(RequestSchema, body);
  if (!validation.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Invalid request', details: validation.error }),
    };
  }

  const borrower = await borrowerRepository.findByCognitoSub(user.cognitoSub);
  if (!borrower) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Borrower profile not found' }),
    };
  }

  const extraction = await analyzeDocumentImage(
    validation.data.imageBase64,
    validation.data.documentType
  );

  await auditLog({
    action: 'AI_DOCUMENT_ANALYZED',
    userId: user.cognitoSub,
    resourceType: 'DOCUMENT',
    resourceId: borrower.id,
    requestId,
    metadata: {
      documentType: validation.data.documentType,
      hasError: !!extraction.error,
    },
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
    body: JSON.stringify({ extraction }),
  };
}

export const handler = withErrorHandler(requireRole('BORROWER')(handleAnalyzeDocument));
