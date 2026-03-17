/**
 * GET /financial/accounts
 * List linked bank accounts for the authenticated borrower
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { errorHandler } from '../../middleware/error-handler';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';
import * as plaidItemRepo from '../../db/repositories/plaid-item-repository';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId } = event;

  try {
    const borrowerId = await getIdByCognitoSub(user.sub);
    if (!borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    const items = await plaidItemRepo.findByBorrowerId(borrowerId);

    const accounts = items.map((item) => ({
      id: item.id,
      institutionId: item.institution_id,
      institutionName: item.institution_name,
      accountCount: item.account_ids.length,
      status: item.status,
      lastSyncedAt: item.last_synced_at?.toISOString() ?? null,
      createdAt: item.created_at.toISOString(),
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify(accounts),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
