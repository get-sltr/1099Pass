/**
 * GET /reports
 * List reports for the authenticated borrower (from S3 prefix).
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { errorHandler } from '../../middleware/error-handler';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function listReportsHandler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId } = event;
  const bucket = process.env.REPORTS_BUCKET;

  if (!bucket) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const prefix = `reports/${user.sub}/`;
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    const keys = response.Contents || [];
    const reports = keys
      .filter((o) => o.Key?.endsWith('.json'))
      .map((o) => {
        const key = o.Key!;
        const reportId = key.replace(prefix, '').replace('.json', '');
        return {
          reportId,
          generatedAt: o.LastModified?.toISOString() ?? null,
        };
      })
      .sort((a, b) => (b.generatedAt ?? '').localeCompare(a.generatedAt ?? ''));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ data: reports }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const handler = withAuth(listReportsHandler);
