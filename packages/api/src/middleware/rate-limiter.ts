import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDBClient } from '../config/aws';
import { config } from '../config/environment';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  userId: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const client = getDynamoDBClient();
  const tableName = config.sessionsTable;
  const key = `ratelimit#${userId}#${action}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  const result = await client.send(new GetCommand({
    TableName: tableName,
    Key: { userId: key, sessionId: 'ratelimit' },
  }));

  const item = result.Item;
  const currentCount = item?.count ?? 0;
  const lastReset = item?.lastReset ?? now;

  if (lastReset < windowStart) {
    // Window expired, reset
    await client.send(new UpdateCommand({
      TableName: tableName,
      Key: { userId: key, sessionId: 'ratelimit' },
      UpdateExpression: 'SET #count = :one, lastReset = :now, #ttl = :ttl',
      ExpressionAttributeNames: { '#count': 'count', '#ttl': 'ttl' },
      ExpressionAttributeValues: { ':one': 1, ':now': now, ':ttl': now + windowSeconds * 2 },
    }));
    return { allowed: true, remaining: limit - 1, resetAt: now + windowSeconds };
  }

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, resetAt: lastReset + windowSeconds };
  }

  await client.send(new UpdateCommand({
    TableName: tableName,
    Key: { userId: key, sessionId: 'ratelimit' },
    UpdateExpression: 'SET #count = #count + :one',
    ExpressionAttributeNames: { '#count': 'count' },
    ExpressionAttributeValues: { ':one': 1 },
  }));

  return { allowed: true, remaining: limit - currentCount - 1, resetAt: lastReset + windowSeconds };
}

type HandlerFn = (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;

export function withRateLimit(limit: number, windowSeconds: number, getUserId: (event: APIGatewayProxyEvent) => string) {
  return (handler: HandlerFn): HandlerFn => {
    return async (event, context) => {
      const userId = getUserId(event);
      const action = `${event.httpMethod}:${event.resource}`;
      const result = await checkRateLimit(userId, action, limit, windowSeconds);

      if (!result.allowed) {
        return {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
          },
          body: JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
        };
      }

      const response = await handler(event, context);
      response.headers = {
        ...response.headers,
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      };
      return response;
    };
  };
}
