/**
 * GET /scoring/current
 * Get current loan readiness score for authenticated borrower
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { loanScoreService, type DocumentationStatus } from '../../services/loan-score-service';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId } = event;

  try {
    // Initialize Plaid service
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );
    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');

    // Fetch and normalize income
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    const transactions = await plaidService.fetchTransactions(
      'mock-token',
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );

    const incomeProfile = incomeNormalizationService.normalizeIncome(
      user.sub,
      transactions,
      24
    );

    // TODO: Get actual documentation status from database
    const documentationStatus: DocumentationStatus = {
      hasTaxReturns: true,
      has1099Forms: true,
      hasBankStatements: true,
      hasW2Forms: false,
      hasOtherIncomeDocs: false,
      linkedBankAccounts: 1,
    };

    // Calculate score
    const loanScore = loanScoreService.calculateScore(
      incomeProfile,
      documentationStatus
    );

    // Audit log
    await auditLog({
      action: 'LOAN_SCORE_VIEWED',
      userId: user.sub,
      resourceType: 'LOAN_SCORE',
      resourceId: user.sub,
      requestId,
      metadata: {
        score: loanScore.overallScore,
        grade: loanScore.letterGrade,
      },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        score: loanScore.overallScore,
        letterGrade: loanScore.letterGrade,
        calculatedAt: loanScore.calculatedAt,
        qualifiedLoanTypes: loanScore.qualifiedLoanTypes,
        potentialLoanTypes: loanScore.potentialLoanTypes,
        topRecommendation: loanScore.recommendations[0] || null,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
