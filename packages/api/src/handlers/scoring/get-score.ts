/**
 * GET /scoring/current
 * Get current loan readiness score for authenticated borrower
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { loanScoreService } from '../../services/loan-score-service';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';
import * as plaidItemRepo from '../../db/repositories/plaid-item-repository';
import { getDocumentationStatus } from '../../db/repositories/document-repository';
import { getIdByCognitoSub } from '../../db/repositories/borrower-repository';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { user, requestId } = event;

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

    // Fetch and normalize income
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    const transactions = await plaidService.fetchTransactions(
      linkedAccounts[0]!.encrypted_access_token,
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );

    const incomeProfile = incomeNormalizationService.normalizeIncome(
      borrowerId,
      transactions,
      24
    );

    // Get actual documentation status from database
    const documentationStatus = await getDocumentationStatus(borrowerId);

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
