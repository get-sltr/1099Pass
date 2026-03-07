/**
 * subscriptions table access for lender billing (Square) and borrower IAP (Apple/Google).
 */

import { query } from './client';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  user_type: 'BORROWER' | 'LENDER';
  tier: string;
  store_customer_id: string;
  store_subscription_id: string | null;
  store_type: 'APPLE' | 'GOOGLE' | 'SQUARE';
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export async function getActiveSubscription(
  userId: string,
  userType: 'BORROWER' | 'LENDER',
): Promise<SubscriptionRow | null> {
  const result = await query<SubscriptionRow>(
    `SELECT * FROM subscriptions
     WHERE user_id = $1 AND user_type = $2 AND status IN ('ACTIVE', 'TRIALING')
     ORDER BY created_at DESC LIMIT 1`,
    [userId, userType],
  );
  return result.rows[0] ?? null;
}

export async function getSubscriptionById(id: string): Promise<SubscriptionRow | null> {
  const result = await query<SubscriptionRow>(
    `SELECT * FROM subscriptions WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getSubscriptionByStoreId(
  storeSubscriptionId: string,
): Promise<SubscriptionRow | null> {
  const result = await query<SubscriptionRow>(
    `SELECT * FROM subscriptions WHERE store_subscription_id = $1`,
    [storeSubscriptionId],
  );
  return result.rows[0] ?? null;
}

export async function createSubscription(data: {
  userId: string;
  userType: 'BORROWER' | 'LENDER';
  tier: string;
  storeCustomerId: string;
  storeSubscriptionId: string;
  storeType: 'APPLE' | 'GOOGLE' | 'SQUARE';
  status: string;
  periodStart: string;
  periodEnd: string;
}): Promise<SubscriptionRow> {
  const result = await query<SubscriptionRow>(
    `INSERT INTO subscriptions
       (user_id, user_type, tier, store_customer_id, store_subscription_id,
        store_type, status, current_period_start, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz)
     RETURNING *`,
    [
      data.userId,
      data.userType,
      data.tier,
      data.storeCustomerId,
      data.storeSubscriptionId,
      data.storeType,
      data.status,
      data.periodStart,
      data.periodEnd,
    ],
  );
  return result.rows[0];
}

export async function updateSubscriptionStatus(
  id: string,
  status: string,
): Promise<void> {
  await query(
    `UPDATE subscriptions SET status = $2, updated_at = NOW() WHERE id = $1`,
    [id, status],
  );
}

export async function updateSubscriptionFromWebhook(data: {
  storeSubscriptionId: string;
  status: string;
  periodStart?: string;
  periodEnd?: string;
}): Promise<void> {
  const setClauses = ['status = $2', 'updated_at = NOW()'];
  const params: (string | null)[] = [data.storeSubscriptionId, data.status];
  let idx = 3;

  if (data.periodStart) {
    setClauses.push(`current_period_start = $${idx}::timestamptz`);
    params.push(data.periodStart);
    idx++;
  }
  if (data.periodEnd) {
    setClauses.push(`current_period_end = $${idx}::timestamptz`);
    params.push(data.periodEnd);
    idx++;
  }

  await query(
    `UPDATE subscriptions SET ${setClauses.join(', ')} WHERE store_subscription_id = $1`,
    params,
  );
}

export async function cancelSubscriptionByStoreId(
  storeSubscriptionId: string,
): Promise<void> {
  await query(
    `UPDATE subscriptions SET status = 'CANCELED', updated_at = NOW()
     WHERE store_subscription_id = $1`,
    [storeSubscriptionId],
  );
}
