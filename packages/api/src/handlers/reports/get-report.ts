/**
 * GET /reports/:id
 * Get a specific report (JSON format)
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
    // Fetch report from S3
    const command = new GetObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: `reports/${user.sub}/${reportId}.json`,
    });

    const response = await s3Client.send(command);
    const reportJson = await response.Body?.transformToString();

    if (!reportJson) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    const report = JSON.parse(reportJson);

    // Verify ownership
    if (report.metadata.borrowerId !== user.sub) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    // Check if expired
    if (new Date(report.metadata.expiresAt) < new Date()) {
      report.metadata.status = 'EXPIRED';
    }

    // Audit log
    await auditLog({
      action: 'REPORT_VIEWED',
      userId: user.sub,
      resourceType: 'REPORT',
      resourceId: reportId,
      requestId,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify(report),
    };
  } catch (error) {
    if ((error as Error).name === 'NoSuchKey') {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
