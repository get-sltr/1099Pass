/**
 * POST /subscriptions/subscribe — Lender subscribes to a plan.
 *
 * Body: { planId: 'PRO' | 'ULTRA', sourceId: string }
 * sourceId is the card nonce from Square Web Payments SDK.
 *
 * Flow: find/create Square customer → store card → ensure catalog plans →
 *       create subscription → persist in DB → return subscription.
 */

import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { withErrorHandler, ValidationError } from '../../middleware/error-handler';
import { requireRole, AuthenticatedEvent } from '../../middleware/auth-middleware';
import {
  getSquareAccessToken,
  getSquareClient,
  getDefaultLocationId,
  findOrCreateCustomer,
  storeCard,
  ensureSubscriptionPlans,
  createSquareSubscription,
  PLAN_TIERS,
  PlanKey,
} from '../../services/square-service';
import {
  getActiveSubscription,
  createSubscription,
} from '../../db/subscriptions';

const VALID_PLANS: PlanKey[] = ['PRO', 'ULTRA'];

async function handleSubscribe(
  event: AuthenticatedEvent,
  _context: Context,
): Promise<APIGatewayProxyResult> {
  const body = JSON.parse(event.body || '{}');
  const { planId, sourceId } = body as { planId?: string; sourceId?: string };

  if (!planId || !VALID_PLANS.includes(planId as PlanKey)) {
    throw new ValidationError('planId must be PRO or ULTRA');
  }
  if (!sourceId) {
    throw new ValidationError('sourceId (card nonce) is required');
  }

  const existing = await getActiveSubscription(event.user.userId, 'LENDER');
  if (existing) {
    throw new ValidationError(
      'You already have an active subscription. Cancel it first or contact support to change plans.',
    );
  }

  const secretArn = process.env.SQUARE_SECRET_ARN!;
  const isSandbox = process.env.ENVIRONMENT !== 'production';
  const accessToken = await getSquareAccessToken(secretArn);
  const client = getSquareClient(accessToken, isSandbox);

  const locationId = await getDefaultLocationId(client);

  const customer = await findOrCreateCustomer(client, {
    email: event.user.email,
    givenName: event.user.name,
    referenceId: event.user.userId,
  });

  const card = await storeCard(client, customer.id, sourceId);

  const planVariationIds = await ensureSubscriptionPlans(client);
  const planVariationId = planVariationIds[planId as PlanKey];

  const squareSub = await createSquareSubscription(client, {
    locationId,
    customerId: customer.id,
    planVariationId,
    cardId: card.id,
  });

  const now = new Date().toISOString();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const dbSub = await createSubscription({
    userId: event.user.userId,
    userType: 'LENDER',
    tier: PLAN_TIERS[planId as PlanKey].dbTier,
    storeCustomerId: customer.id,
    storeSubscriptionId: squareSub.id,
    storeType: 'SQUARE',
    status: 'ACTIVE',
    periodStart: squareSub.startDate ?? now,
    periodEnd: periodEnd.toISOString(),
  });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        subscriptionId: dbSub.id,
        tier: dbSub.tier,
        status: dbSub.status,
        currentPeriodEnd: dbSub.current_period_end,
      },
    }),
  };
}

export const handler = withErrorHandler(requireRole('LENDER')(handleSubscribe));
