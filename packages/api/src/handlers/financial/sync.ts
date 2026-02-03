/**
 * POST /financial/sync
 * Trigger income data sync from linked accounts
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { validateRequest } from '../../middleware/request-validator';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const RequestSchema = z.object({
  accountId: z.string().uuid().optional(),
  forceRefresh: z.boolean().optional().default(false),
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

    // Calculate date range (24 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    // TODO: Get linked account from database
    // For now, use mock data in mock mode
    const encryptedToken = 'mock-token';

    // Fetch transactions
    const transactions = await plaidService.fetchTransactions(
      encryptedToken,
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );

    // Normalize income
    const incomeProfile = incomeNormalizationService.normalizeIncome(
      user.sub,
      transactions,
      24
    );

    // TODO: Store income profile in database

    // Audit log
    await auditLog({
      action: 'INCOME_DATA_SYNCED',
      userId: user.sub,
      resourceType: 'FINANCIAL_PROFILE',
      resourceId: user.sub,
      requestId,
      metadata: {
        transactionCount: transactions.length,
        incomeSourceCount: incomeProfile.incomeSources.length,
        monthsAnalyzed: incomeProfile.monthsAnalyzed,
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        status: 'SYNCED',
        transactionCount: transactions.length,
        incomeSourceCount: incomeProfile.incomeSources.length,
        monthsAnalyzed: incomeProfile.monthsAnalyzed,
        projectedAnnualIncome: incomeProfile.annualizedProjection.finalProjection / 100,
        lastSyncedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
