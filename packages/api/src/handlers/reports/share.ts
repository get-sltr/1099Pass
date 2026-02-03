/**
 * POST /reports/:id/share
 * Generate a share token for a report
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createReportGeneratorService } from '../../services/report-generator-service';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
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
    // Verify report exists and belongs to user
    const reportCommand = new GetObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: `reports/${user.sub}/${reportId}.json`,
    });

    try {
      const reportResponse = await s3Client.send(reportCommand);
      const reportJson = await reportResponse.Body?.transformToString();
      const report = JSON.parse(reportJson || '{}');

      if (report.metadata?.borrowerId !== user.sub) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
          body: JSON.stringify({ error: 'Access denied' }),
        };
      }
    } catch {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    // Generate share token
    const reportService = createReportGeneratorService(
      process.env.REPORTS_BUCKET || '',
      process.env.AWS_REGION
    );

    const shareToken = reportService.generateShareToken(reportId, user.sub);

    // Store share token in DynamoDB
    // TODO: Create proper share_tokens table
    await docClient.send(
      new PutCommand({
        TableName: process.env.SHARE_TOKENS_TABLE || 'share-tokens',
        Item: {
          token: shareToken.token,
          reportId: shareToken.reportId,
          borrowerId: shareToken.borrowerId,
          createdAt: shareToken.createdAt.toISOString(),
          expiresAt: shareToken.expiresAt.toISOString(),
          isRevoked: false,
          accessCount: 0,
          ttl: Math.floor(shareToken.expiresAt.getTime() / 1000),
        },
      })
    );

    // Audit log
    await auditLog({
      action: 'REPORT_SHARE_TOKEN_CREATED',
      userId: user.sub,
      resourceType: 'SHARE_TOKEN',
      resourceId: shareToken.token,
      requestId,
      metadata: {
        reportId,
        expiresAt: shareToken.expiresAt.toISOString(),
      },
    });

    // Build share URL
    const baseUrl = process.env.SHARE_BASE_URL || 'https://app.1099pass.com';
    const shareUrl = `${baseUrl}/shared/${shareToken.token}`;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        token: shareToken.token,
        shareUrl,
        expiresAt: shareToken.expiresAt,
        validForDays: 30,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
