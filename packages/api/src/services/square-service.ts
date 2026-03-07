/**
 * Square API client for lender subscription billing.
 * Uses Square SDK v44+. Access token stored in AWS Secrets Manager.
 *
 * Lender tiers: STARTER ($99/mo), PROFESSIONAL ($299/mo), ENTERPRISE ($799/mo).
 * Borrower billing uses StoreKit/Google Play — NOT Square.
 */

import { SquareClient } from 'square';
import { randomUUID } from 'crypto';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getSecretsManagerClient } from '../config/aws';

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

let cachedClient: SquareClient | null = null;

export function getSquareClient(accessToken: string, sandbox = false): SquareClient {
  if (!cachedClient) {
    cachedClient = new SquareClient({
      token: accessToken,
      environment: sandbox ? 'sandbox' : 'production',
    });
  }
  return cachedClient;
}

export async function getSquareAccessToken(secretArn: string): Promise<string> {
  const sm = getSecretsManagerClient();
  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretArn }));
  const raw = res.SecretString?.trim();
  if (!raw) throw new Error('Square access token not found in Secrets Manager');
  return raw;
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

let cachedLocationId: string | null = null;

export async function getDefaultLocationId(client: SquareClient): Promise<string> {
  if (cachedLocationId) return cachedLocationId;

  const locationId = process.env.SQUARE_LOCATION_ID;
  if (locationId) {
    cachedLocationId = locationId;
    return locationId;
  }

  const res = await client.locations.list();
  const locations = (res as any).locations ?? (res as any).data?.locations ?? [];
  if (!locations.length) throw new Error('No Square locations found');
  cachedLocationId = locations[0].id;
  return cachedLocationId!;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function findOrCreateCustomer(
  client: SquareClient,
  opts: { email: string; givenName?: string; familyName?: string; referenceId: string },
) {
  const searchRes = await client.customers.search({
    query: {
      filter: {
        referenceId: { exact: opts.referenceId },
      },
    },
  });
  const existing = (searchRes as any).customers?.[0];
  if (existing) return existing;

  const createRes = await client.customers.create({
    idempotencyKey: randomUUID(),
    emailAddress: opts.email,
    givenName: opts.givenName,
    familyName: opts.familyName,
    referenceId: opts.referenceId,
  });
  return (createRes as any).customer;
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export async function storeCard(
  client: SquareClient,
  customerId: string,
  sourceId: string,
) {
  const res = await client.cards.create({
    idempotencyKey: randomUUID(),
    sourceId,
    card: { customerId },
  });
  return (res as any).card;
}

// ---------------------------------------------------------------------------
// Subscription Plans (Catalog)
// ---------------------------------------------------------------------------

export const PLAN_TIERS = {
  PRO: { name: 'Monthly Pro', amountCents: 4999, dbTier: 'PRO' },
  ULTRA: { name: 'Monthly Ultra', amountCents: 49900, dbTier: 'ULTRA' },
} as const;

export type PlanKey = keyof typeof PLAN_TIERS;

let cachedPlanVariationIds: Record<PlanKey, string> | null = null;

export async function ensureSubscriptionPlans(
  client: SquareClient,
): Promise<Record<PlanKey, string>> {
  if (cachedPlanVariationIds) return cachedPlanVariationIds;

  const searchRes = await client.catalog.searchCatalogObjects({
    objectTypes: ['SUBSCRIPTION_PLAN'],
  });
  const plans = (searchRes as any).objects ?? [];
  const existing = plans.find(
    (p: any) => p.subscriptionPlanData?.name === '1099Pass Lender',
  );

  if (existing) {
    const variations = existing.subscriptionPlanData?.subscriptionPlanVariations ?? [];
    const map: Partial<Record<PlanKey, string>> = {};
    for (const v of variations) {
      const vName: string = v.subscriptionPlanVariationData?.name ?? '';
      if (vName === 'Monthly Pro') map.PRO = v.id;
      if (vName === 'Monthly Ultra') map.ULTRA = v.id;
    }
    if (map.PRO && map.ULTRA) {
      cachedPlanVariationIds = map as Record<PlanKey, string>;
      return cachedPlanVariationIds;
    }
  }

  const res = await client.catalog.upsertObject({
    idempotencyKey: randomUUID(),
    object: {
      type: 'SUBSCRIPTION_PLAN',
      id: '#1099pass-plan',
      subscriptionPlanData: {
        name: '1099Pass Lender',
        subscriptionPlanVariations: Object.entries(PLAN_TIERS).map(
          ([key, tier]) => ({
            type: 'SUBSCRIPTION_PLAN_VARIATION' as const,
            id: `#var-${key.toLowerCase()}`,
            subscriptionPlanVariationData: {
              name: tier.name,
              phases: [
                {
                  cadence: 'MONTHLY' as const,
                  recurringPriceMoney: {
                    amount: BigInt(tier.amountCents),
                    currency: 'USD',
                  },
                },
              ],
            },
          }),
        ),
      },
    },
  });

  const mappings: any[] = (res as any).idMappings ?? [];
  const result: Partial<Record<PlanKey, string>> = {};
  for (const m of mappings) {
    const clientId: string = m.clientObjectId ?? '';
    if (clientId === '#var-pro') result.PRO = m.objectId;
    if (clientId === '#var-ultra') result.ULTRA = m.objectId;
  }

  if (!result.PRO || !result.ULTRA) {
    throw new Error('Failed to create subscription plan variations in Square');
  }

  cachedPlanVariationIds = result as Record<PlanKey, string>;
  return cachedPlanVariationIds;
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export async function createSquareSubscription(
  client: SquareClient,
  opts: {
    locationId: string;
    customerId: string;
    planVariationId: string;
    cardId: string;
  },
) {
  const res = await client.subscriptions.create({
    idempotencyKey: randomUUID(),
    locationId: opts.locationId,
    customerId: opts.customerId,
    planVariationId: opts.planVariationId,
    cardId: opts.cardId,
  });
  return (res as any).subscription;
}

export async function cancelSquareSubscription(
  client: SquareClient,
  subscriptionId: string,
) {
  const res = await client.subscriptions.cancel(subscriptionId);
  return (res as any).subscription;
}

export async function getSquareSubscription(
  client: SquareClient,
  subscriptionId: string,
) {
  const res = await client.subscriptions.get(subscriptionId);
  return (res as any).subscription;
}

// ---------------------------------------------------------------------------
// Webhook signature verification
// ---------------------------------------------------------------------------

export function verifyWebhookSignature(
  body: string,
  signature: string,
  signatureKey: string,
  notificationUrl: string,
): boolean {
  const { createHmac } = require('crypto') as typeof import('crypto');
  const hmac = createHmac('sha256', signatureKey);
  hmac.update(notificationUrl + body);
  const expected = hmac.digest('base64');
  return expected === signature;
}
