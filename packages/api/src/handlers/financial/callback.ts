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

    // Exchange public token for access token
    const linkedAccount = await plaidService.exchangePublicToken(publicToken, user.sub);

    // TODO: Store linkedAccount in database
    // For now, we'll return the account info (minus the encrypted token)

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
