/**
 * GET /scoring/breakdown
 * Get detailed loan readiness score breakdown
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
      action: 'LOAN_SCORE_BREAKDOWN_VIEWED',
      userId: user.sub,
      resourceType: 'LOAN_SCORE',
      resourceId: user.sub,
      requestId,
    });

    // Return detailed breakdown
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        overallScore: loanScore.overallScore,
        letterGrade: loanScore.letterGrade,
        calculatedAt: loanScore.calculatedAt,

        components: {
          incomeStability: {
            score: loanScore.breakdown.incomeStability.rawScore,
            weight: loanScore.breakdown.incomeStability.weight,
            weightedScore: loanScore.breakdown.incomeStability.weightedScore,
            factors: loanScore.breakdown.incomeStability.factors,
            improvementTips: loanScore.breakdown.incomeStability.improvementTips,
          },
          incomeTrend: {
            score: loanScore.breakdown.incomeTrend.rawScore,
            weight: loanScore.breakdown.incomeTrend.weight,
            weightedScore: loanScore.breakdown.incomeTrend.weightedScore,
            factors: loanScore.breakdown.incomeTrend.factors,
            improvementTips: loanScore.breakdown.incomeTrend.improvementTips,
          },
          incomeDiversity: {
            score: loanScore.breakdown.incomeDiversity.rawScore,
            weight: loanScore.breakdown.incomeDiversity.weight,
            weightedScore: loanScore.breakdown.incomeDiversity.weightedScore,
            factors: loanScore.breakdown.incomeDiversity.factors,
            improvementTips: loanScore.breakdown.incomeDiversity.improvementTips,
          },
          documentationCompleteness: {
            score: loanScore.breakdown.documentationCompleteness.rawScore,
            weight: loanScore.breakdown.documentationCompleteness.weight,
            weightedScore: loanScore.breakdown.documentationCompleteness.weightedScore,
            factors: loanScore.breakdown.documentationCompleteness.factors,
            improvementTips: loanScore.breakdown.documentationCompleteness.improvementTips,
          },
          incomeLevel: {
            score: loanScore.breakdown.incomeLevel.rawScore,
            weight: loanScore.breakdown.incomeLevel.weight,
            weightedScore: loanScore.breakdown.incomeLevel.weightedScore,
            factors: loanScore.breakdown.incomeLevel.factors,
            improvementTips: loanScore.breakdown.incomeLevel.improvementTips,
          },
          accountAge: {
            score: loanScore.breakdown.accountAge.rawScore,
            weight: loanScore.breakdown.accountAge.weight,
            weightedScore: loanScore.breakdown.accountAge.weightedScore,
            factors: loanScore.breakdown.accountAge.factors,
            improvementTips: loanScore.breakdown.accountAge.improvementTips,
          },
        },

        recommendations: loanScore.recommendations,

        loanTypeThresholds: loanScore.loanTypeThresholds,
        qualifiedLoanTypes: loanScore.qualifiedLoanTypes,
        potentialLoanTypes: loanScore.potentialLoanTypes,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
