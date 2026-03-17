/**
 * POST /financial/callback
 * Exchange Plaid public token for access token after user completes Link
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createPlaidService } from '../../services/plaid-service';
import { validateRequest } from '../../middleware/request-validator';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';
import * as plaidItemRepo from '../../db/repositories/plaid-item-repository';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';

const RequestSchema = z.object({
  publicToken: z.string().min(1),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
});

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { body, user, requestId } = event;

  // Validate request
  const validation = validateRequest(RequestSchema, body);
  if (!validation.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Invalid request', details: validation.error }),
    };
  }

  const { publicToken } = validation.data;

  try {
    // Initialize Plaid service
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );

    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');

    // Resolve borrower DB id
    const borrowerId = await getIdByCognitoSub(user.sub);
    if (!borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    // Exchange public token for access token
    const linkedAccount = await plaidService.exchangePublicToken(publicToken, borrowerId);

    // Store linked account in database
    await plaidItemRepo.create({
      id: linkedAccount.id,
      borrower_id: borrowerId,
      item_id: linkedAccount.itemId,
      encrypted_access_token: linkedAccount.accessToken,
      institution_id: linkedAccount.institutionId,
      institution_name: linkedAccount.institutionName,
      account_ids: linkedAccount.accountIds,
      consent_expires_at: linkedAccount.consentExpiresAt,
      status: linkedAccount.status,
    });

    // Audit log
    await auditLog({
      action: 'BANK_ACCOUNT_LINKED',
      userId: user.sub,
      resourceType: 'LINKED_ACCOUNT',
      resourceId: linkedAccount.id,
      requestId,
      metadata: {
        institutionId: linkedAccount.institutionId,
        institutionName: linkedAccount.institutionName,
        accountCount: linkedAccount.accountIds.length,
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        accountId: linkedAccount.id,
        institutionId: linkedAccount.institutionId,
        institutionName: linkedAccount.institutionName,
        accountCount: linkedAccount.accountIds.length,
        status: linkedAccount.status,
        linkedAt: linkedAccount.createdAt,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
