/**
 * GET /health
 * Public health check for load balancers, monitoring, and deployment verification.
 * Returns 200 with { status, db } when DB is reachable; 503 when DB is down.
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { healthCheck } from '../../db/client';

export const handler: APIGatewayProxyHandler = async () => {
  const dbOk = await healthCheck();

  const body = {
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk,
    timestamp: new Date().toISOString(),
  };

  return {
    statusCode: dbOk ? 200 : 503,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
    body: JSON.stringify(body),
  };
};
