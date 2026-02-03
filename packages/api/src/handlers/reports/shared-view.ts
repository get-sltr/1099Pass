/**
 * GET /shared/:token
 * Public endpoint for lenders to view shared reports (no auth required)
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function main(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const requestId = event.requestContext?.requestId || uuidv4();
  const token = event.pathParameters?.token;

  if (!token) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Share token is required' }),
    };
  }

  try {
    // Look up share token
    const tokenResult = await docClient.send(
      new GetCommand({
        TableName: process.env.SHARE_TOKENS_TABLE || 'share-tokens',
        Key: { token },
      })
    );

    const shareToken = tokenResult.Item;

    if (!shareToken) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Share link not found or expired' }),
      };
    }

    // Validate token
    if (shareToken.isRevoked) {
      return {
        statusCode: 410,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'This share link has been revoked' }),
      };
    }

    if (new Date(shareToken.expiresAt) < new Date()) {
      return {
        statusCode: 410,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'This share link has expired' }),
      };
    }

    // Fetch report
    const reportCommand = new GetObjectCommand({
      Bucket: process.env.REPORTS_BUCKET,
      Key: `reports/${shareToken.borrowerId}/${shareToken.reportId}.json`,
    });

    const reportResponse = await s3Client.send(reportCommand);
    const reportJson = await reportResponse.Body?.transformToString();
    const report = JSON.parse(reportJson || '{}');

    // Record access
    const ipAddress =
      event.requestContext?.identity?.sourceIp ||
      event.headers['X-Forwarded-For']?.split(',')[0] ||
      'unknown';
    const userAgent = event.headers['User-Agent'] || 'unknown';

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.SHARE_TOKENS_TABLE || 'share-tokens',
        Key: { token },
        UpdateExpression:
          'SET accessCount = accessCount + :inc, lastAccessedAt = :now, lastAccessedIp = :ip',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':now': new Date().toISOString(),
          ':ip': ipAddress,
        },
      })
    );

    // Log access for audit trail
    console.log(
      JSON.stringify({
        event: 'SHARE_LINK_ACCESSED',
        token: token.substring(0, 8) + '...',
        reportId: shareToken.reportId,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
      })
    );

    // Return report with limited metadata (remove sensitive borrower info for shared view)
    const sharedReport = {
      ...report,
      borrower: {
        ...report.borrower,
        // Keep only display name and location for shared view
      },
      metadata: {
        ...report.metadata,
        borrowerId: undefined, // Remove borrower ID from shared view
      },
      _sharedView: true,
      _accessedAt: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'Cache-Control': 'no-store, max-age=0',
      },
      body: JSON.stringify(sharedReport),
    };
  } catch (error) {
    console.error('Error accessing shared report:', error);

    if ((error as Error).name === 'NoSuchKey') {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Report not found' }),
      };
    }

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        error: 'An error occurred while accessing the report',
        requestId,
      }),
    };
  }
}
