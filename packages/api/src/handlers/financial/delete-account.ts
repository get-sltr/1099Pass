/**
 * DELETE /financial/accounts/:id
 * Disconnect a linked bank account
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { errorHandler } from '../../middleware/error-handler';
import { auditLog } from '../../middleware/audit-logger';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';
import * as plaidItemRepo from '../../db/repositories/plaid-item-repository';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId, pathParameters } = event;
  const accountId = pathParameters?.id;

  if (!accountId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Account ID is required' }),
    };
  }

  try {
    const borrowerId = await getIdByCognitoSub(user.sub);
    if (!borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    // Verify the account belongs to this borrower
    const item = await plaidItemRepo.findById(accountId);
    if (!item || item.borrower_id !== borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Account not found' }),
      };
    }

    // Soft-delete: mark as disconnected
    await plaidItemRepo.updateStatus(accountId, 'disconnected');

    await auditLog({
      action: 'BANK_ACCOUNT_DISCONNECTED',
      userId: user.sub,
      resourceType: 'LINKED_ACCOUNT',
      resourceId: accountId,
      requestId,
      metadata: {
        institutionId: item.institution_id,
        institutionName: item.institution_name,
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
