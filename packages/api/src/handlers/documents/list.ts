/**
 * GET /documents
 * List documents for the authenticated borrower
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { errorHandler } from '../../middleware/error-handler';
import { query } from '../../db/client';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';

interface DocumentRow {
  id: string;
  borrower_id: string;
  document_type: string;
  s3_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  status: string;
  verification_notes: string | null;
  uploaded_at: Date;
  verified_at: Date | null;
}

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId } = event;

  try {
    const borrowerId = await getIdByCognitoSub(user.sub);
    if (!borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    const result = await query<DocumentRow>(
      `SELECT * FROM documents WHERE borrower_id = $1 ORDER BY uploaded_at DESC`,
      [borrowerId]
    );

    const documents = result.rows.map((row) => ({
      id: row.id,
      name: row.filename,
      type: row.document_type.toLowerCase(),
      status: row.status.toLowerCase(),
      fileSize: Number(row.size_bytes),
      mimeType: row.mime_type,
      uploadedAt: row.uploaded_at.toISOString(),
      verifiedAt: row.verified_at?.toISOString() ?? undefined,
      notes: row.verification_notes ?? undefined,
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify(documents),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
