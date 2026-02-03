/**
 * GET /reports/:id/pdf
 * Get PDF version of a report (returns presigned download URL)
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId, pathParameters } = event;
  const reportId = pathParameters?.id;

  if (!reportId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Report ID is required' }),
    };
  }

  try {
    const pdfKey = `reports/${user.sub}/${reportId}.pdf`;

    // Check if PDF exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.REPORTS_BUCKET,
          Key: pdfKey,
        })
      );
    } catch {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Report PDF not found' }),
      };
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: pdfKey,
      ResponseContentDisposition: `attachment; filename="1099Pass-Report-${reportId.substring(0, 8)}.pdf"`,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Audit log
    await auditLog({
      action: 'REPORT_PDF_DOWNLOADED',
      userId: user.sub,
      resourceType: 'REPORT',
      resourceId: reportId,
      requestId,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        downloadUrl,
        expiresIn: 3600,
        filename: `1099Pass-Report-${reportId.substring(0, 8)}.pdf`,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
