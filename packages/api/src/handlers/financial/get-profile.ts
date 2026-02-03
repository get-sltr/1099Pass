/**
 * GET /financial/profile
 * Get normalized financial profile for authenticated borrower
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
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

    // Calculate date range (24 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    // TODO: Get linked accounts from database and use real tokens
    // For now, use mock data
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

    // Audit log
    await auditLog({
      action: 'FINANCIAL_PROFILE_VIEWED',
      userId: user.sub,
      resourceType: 'FINANCIAL_PROFILE',
      resourceId: user.sub,
      requestId,
    });

    // Return profile (convert cents to dollars for API response)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        borrowerId: incomeProfile.borrowerId,
        generatedAt: incomeProfile.generatedAt,
        periodStart: incomeProfile.periodStart,
        periodEnd: incomeProfile.periodEnd,
        monthsAnalyzed: incomeProfile.monthsAnalyzed,

        summary: {
          projectedAnnualIncome: incomeProfile.totalProjectedAnnualIncome / 100,
          averageMonthlyIncome: incomeProfile.averageMonthlyIncome / 100,
          activeIncomeSourceCount: incomeProfile.activeIncomeSourceCount,
          trajectory: incomeProfile.trajectory,
        },

        incomeSources: incomeProfile.incomeSources.map((source) => ({
          id: source.id,
          name: source.name,
          platformType: source.platformType,
          monthlyAverage: source.monthlyAverageCents / 100,
          annualTotal: source.totalIncomeCents / 100,
          monthsActive: source.monthsActive,
          verificationStatus: source.verificationStatus,
        })),

        monthlyHistory: incomeProfile.monthlyHistory.map((month) => ({
          month: month.month,
          total: month.totalCents / 100,
          isAnomaly: month.isAnomaly,
        })),

        stabilityMetrics: incomeProfile.stabilityMetrics,

        projection: {
          annual: incomeProfile.annualizedProjection.finalProjection / 100,
          confidenceIntervalLow: incomeProfile.annualizedProjection.confidenceIntervalLow / 100,
          confidenceIntervalHigh: incomeProfile.annualizedProjection.confidenceIntervalHigh / 100,
          confidenceLevel: incomeProfile.annualizedProjection.confidenceLevel,
          primaryMethod: incomeProfile.annualizedProjection.primaryMethod,
        },

        debtAnalysis: {
          estimatedDTI: incomeProfile.debtAnalysis.estimatedDTI,
          monthlyObligations: incomeProfile.debtAnalysis.totalMonthlyObligations / 100,
          caveat: incomeProfile.debtAnalysis.caveat,
        },

        riskAssessment: {
          level: incomeProfile.riskLevel,
          riskFactors: incomeProfile.riskFactors,
          positiveFactors: incomeProfile.positiveFactors,
        },
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
