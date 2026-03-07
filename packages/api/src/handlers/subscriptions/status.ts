/**
 * GET /subscriptions/current — Get lender's active subscription.
 */

import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { withErrorHandler } from '../../middleware/error-handler';
import { requireRole, AuthenticatedEvent } from '../../middleware/auth-middleware';
import { getActiveSubscription } from '../../db/subscriptions';

async function handleStatus(
  event: AuthenticatedEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  const sub = await getActiveSubscription(event.user.userId, 'LENDER');

  if (!sub) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: null }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        subscriptionId: sub.id,
        tier: sub.tier,
        status: sub.status,
        storeType: sub.store_type,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        createdAt: sub.created_at,
      },
    }),
  };
}

export const handler = withErrorHandler(requireRole('LENDER')(handleStatus));
