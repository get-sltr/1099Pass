/**
 * POST /subscriptions/webhook — Square webhook handler (public, no Cognito auth).
 * Verifies HMAC-SHA256 signature, then processes subscription lifecycle events.
 *
 * Set SQUARE_WEBHOOK_SIGNATURE_KEY env var from the Square Developer Dashboard.
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { verifyWebhookSignature } from '../../services/square-service';
import {
  getSubscriptionByStoreId,
  updateSubscriptionFromWebhook,
  cancelSubscriptionByStoreId,
} from '../../db/subscriptions';

export const handler: APIGatewayProxyHandler = async (event) => {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL ?? '';

  if (signatureKey && event.body) {
    const sig = event.headers['x-square-hmacsha256-signature'] ?? '';
    if (!verifyWebhookSignature(event.body, sig, signatureKey, notificationUrl)) {
      return { statusCode: 403, body: 'Invalid signature' };
    }
  }

  const body = JSON.parse(event.body || '{}');
  const eventType: string = body.type ?? '';
  const data = body.data?.object ?? {};

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const sub = data.subscription;
        if (!sub?.id) break;

        const existing = await getSubscriptionByStoreId(sub.id);
        if (!existing) break;

        const statusMap: Record<string, string> = {
          ACTIVE: 'ACTIVE',
          CANCELED: 'CANCELED',
          DEACTIVATED: 'CANCELED',
          PAUSED: 'PAST_DUE',
          PENDING: 'INCOMPLETE',
        };

        await updateSubscriptionFromWebhook({
          storeSubscriptionId: sub.id,
          status: statusMap[sub.status] ?? existing.status,
          periodStart: sub.startDate,
          periodEnd: sub.chargedThroughDate,
        });
        break;
      }

      case 'subscription.canceled':
      case 'subscription.deactivated': {
        const sub = data.subscription;
        if (sub?.id) await cancelSubscriptionByStoreId(sub.id);
        break;
      }

      default:
        console.log(`Unhandled Square webhook event: ${eventType}`);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
