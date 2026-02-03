/**
 * POST /financial/connect
 * Initiate Plaid Link flow for bank account connection
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createPlaidService } from '../../services/plaid-service';
import { validateRequest } from '../../middleware/request-validator';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const RequestSchema = z.object({
  redirectUri: z.string().url().optional(),
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

  try {
    // Initialize Plaid service
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );

    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');

    // Create link token
    const { linkToken, expiration } = await plaidService.createLinkToken(user.sub);

    // Audit log
    await auditLog({
      action: 'PLAID_LINK_INITIATED',
      userId: user.sub,
      resourceType: 'FINANCIAL',
      resourceId: null,
      requestId,
      metadata: { expiration },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        linkToken,
        expiration,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
