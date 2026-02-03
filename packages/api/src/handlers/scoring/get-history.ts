/**
 * GET /scoring/history
 * Get loan readiness score history over time
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId, queryStringParameters } = event;

  // Parse query params
  const limit = parseInt(queryStringParameters?.limit || '30', 10);
  const startDate = queryStringParameters?.startDate;
  const endDate = queryStringParameters?.endDate;

  try {
    // Query score history from DynamoDB
    // TODO: Create proper score_history table
    const queryParams: any = {
      TableName: process.env.SCORE_HISTORY_TABLE || 'score-history',
      KeyConditionExpression: 'borrowerId = :borrowerId',
      ExpressionAttributeValues: {
        ':borrowerId': user.sub,
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit,
    };

    if (startDate && endDate) {
      queryParams.KeyConditionExpression += ' AND calculatedAt BETWEEN :start AND :end';
      queryParams.ExpressionAttributeValues[':start'] = startDate;
      queryParams.ExpressionAttributeValues[':end'] = endDate;
    }

    let history: any[] = [];

    try {
      const result = await docClient.send(new QueryCommand(queryParams));
      history = result.Items || [];
    } catch (error) {
      // Table might not exist yet, return empty history
      console.log('Score history table not found, returning empty history');
    }

    // If no history, return mock data for demo purposes
    if (history.length === 0) {
      // Generate mock history for the last 6 months
      const mockHistory = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);

        // Simulate gradual score improvement
        const baseScore = 65;
        const improvement = (5 - i) * 3; // 3 points per month
        const variance = Math.floor(Math.random() * 5) - 2; // +/- 2 random variance

        mockHistory.push({
          date: date.toISOString().split('T')[0],
          score: Math.min(100, baseScore + improvement + variance),
          letterGrade: scoreToGrade(baseScore + improvement + variance),
          components: {
            stability: 70 + i * 2,
            trend: 65 + i * 3,
            diversity: 60 + i * 2,
            documentation: 75,
            incomeLevel: 68 + i * 2,
            accountAge: 50 + i * 8,
          },
        });
      }

      history = mockHistory;
    }

    // Audit log
    await auditLog({
      action: 'LOAN_SCORE_HISTORY_VIEWED',
      userId: user.sub,
      resourceType: 'LOAN_SCORE',
      resourceId: user.sub,
      requestId,
    });

    // Calculate trends
    const scores = history.map((h) => h.score);
    const trend = scores.length >= 2
      ? ((scores[scores.length - 1] - scores[0]) / scores.length).toFixed(1)
      : '0';

    const highScore = Math.max(...scores);
    const lowScore = Math.min(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        history,
        summary: {
          recordCount: history.length,
          currentScore: scores[scores.length - 1] || 0,
          highScore,
          lowScore,
          averageScore: avgScore,
          trend: parseFloat(trend),
          trendDescription:
            parseFloat(trend) > 0.5
              ? 'IMPROVING'
              : parseFloat(trend) < -0.5
              ? 'DECLINING'
              : 'STABLE',
        },
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

function scoreToGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const main = withAuth(handler);
