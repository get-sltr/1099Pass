/**
 * POST /subscriptions/cancel — Cancel lender's active subscription.
 * Cancels in both Square and our DB.
 */

import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { withErrorHandler, NotFoundError } from '../../middleware/error-handler';
import { requireRole, AuthenticatedEvent } from '../../middleware/auth-middleware';
import {
  getSquareAccessToken,
  getSquareClient,
  cancelSquareSubscription,
} from '../../services/square-service';
import {
  getActiveSubscription,
  updateSubscriptionStatus,
} from '../../db/subscriptions';

async function handleCancel(
  event: AuthenticatedEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  const sub = await getActiveSubscription(event.user.userId, 'LENDER');

  if (!sub || !sub.store_subscription_id) {
    throw new NotFoundError('Active subscription');
  }

  const secretArn = process.env.SQUARE_SECRET_ARN!;
  const isSandbox = process.env.ENVIRONMENT !== 'production';
  const accessToken = await getSquareAccessToken(secretArn);
  const client = getSquareClient(accessToken, isSandbox);

  await cancelSquareSubscription(client, sub.store_subscription_id);
  await updateSubscriptionStatus(sub.id, 'CANCELED');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { subscriptionId: sub.id, status: 'CANCELED' },
    }),
  };
}

export const handler = withErrorHandler(requireRole('LENDER')(handleCancel));
