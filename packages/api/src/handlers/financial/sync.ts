/**
 * POST /financial/sync
 * Trigger income data sync from linked accounts
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { loanScoreService } from '../../services/loan-score-service';
import { validateRequest } from '../../middleware/request-validator';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';
import * as plaidItemRepo from '../../db/repositories/plaid-item-repository';
import * as financialProfileRepo from '../../db/repositories/financial-profile-repository';
import { getDocumentationStatus } from '../../db/repositories/document-repository';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';

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
    // Resolve borrower DB id
    const borrowerId = await getIdByCognitoSub(user.sub);
    if (!borrowerId) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    // Initialize Plaid service
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );

    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');

    // Get linked accounts from database
    const linkedAccounts = await plaidItemRepo.findByBorrowerId(borrowerId);
    if (linkedAccounts.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'No linked bank accounts. Connect a bank account first.' }),
      };
    }

    // If specific account requested, use that; otherwise use the first linked account
    const targetAccount = validation.data.accountId
      ? linkedAccounts.find((a) => a.id === validation.data.accountId)
      : linkedAccounts[0];

    if (!targetAccount) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Linked account not found' }),
      };
    }

    // Calculate date range (24 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    // Fetch transactions using the real encrypted token
    const transactions = await plaidService.fetchTransactions(
      targetAccount.encrypted_access_token,
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );

    // Normalize income
    const incomeProfile = incomeNormalizationService.normalizeIncome(
      borrowerId,
      transactions,
      24
    );

    // Get documentation status for score calculation
    const documentationStatus = await getDocumentationStatus(borrowerId);
    const loanScore = loanScoreService.calculateScore(incomeProfile, documentationStatus);

    // Store income profile in database
    await financialProfileRepo.upsert({
      borrower_id: borrowerId,
      total_annual_income: incomeProfile.totalProjectedAnnualIncome / 100,
      income_sources: incomeProfile.incomeSources.map((s) => ({
        name: s.name,
        platformType: s.platformType,
        monthlyAverage: s.monthlyAverageCents / 100,
        annualTotal: s.totalIncomeCents / 100,
        monthsActive: s.monthsActive,
      })),
      monthly_average: incomeProfile.averageMonthlyIncome / 100,
      income_trend: incomeProfile.trajectory,
      debt_to_income_ratio: incomeProfile.debtAnalysis.estimatedDTI,
      loan_readiness_score: loanScore.overallScore,
    });

    // Update last synced timestamp on the plaid item
    await plaidItemRepo.updateLastSynced(targetAccount.id);

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
