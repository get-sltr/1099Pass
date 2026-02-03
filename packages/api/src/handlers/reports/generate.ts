/**
 * POST /reports/generate
 * Generate a new lender-ready income verification report
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { loanScoreService, type DocumentationStatus } from '../../services/loan-score-service';
import { createReportGeneratorService, type DocumentVerification } from '../../services/report-generator-service';
import { validateRequest } from '../../middleware/request-validator';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';
import { errorHandler } from '../../middleware/error-handler';

const RequestSchema = z.object({
  includeHistory: z.boolean().optional().default(true),
  targetLoanType: z.enum(['MORTGAGE', 'AUTO', 'PERSONAL', 'BUSINESS', 'HELOC']).optional(),
  targetLoanAmount: z.number().positive().optional(),
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

  const { targetLoanType, targetLoanAmount } = validation.data;

  try {
    // Initialize services
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );
    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');

    const reportService = createReportGeneratorService(
      process.env.REPORTS_BUCKET || '',
      process.env.AWS_REGION
    );

    // Fetch and normalize income data
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

    // Calculate loan readiness score
    const loanScore = loanScoreService.calculateScore(
      incomeProfile,
      documentationStatus,
      targetLoanAmount ? targetLoanAmount * 100 : undefined,
      targetLoanType
    );

    // Build document verification status
    const documentVerification: DocumentVerification[] = [
      {
        documentType: 'Tax Returns',
        verifiedAt: documentationStatus.hasTaxReturns ? new Date() : null,
        status: documentationStatus.hasTaxReturns ? 'VERIFIED' : 'NOT_PROVIDED',
      },
      {
        documentType: '1099 Forms',
        verifiedAt: documentationStatus.has1099Forms ? new Date() : null,
        status: documentationStatus.has1099Forms ? 'VERIFIED' : 'NOT_PROVIDED',
      },
      {
        documentType: 'Bank Statements',
        verifiedAt: documentationStatus.hasBankStatements ? new Date() : null,
        status: documentationStatus.hasBankStatements ? 'VERIFIED' : 'NOT_PROVIDED',
      },
      {
        documentType: 'Linked Bank Accounts',
        verifiedAt: documentationStatus.linkedBankAccounts > 0 ? new Date() : null,
        status: documentationStatus.linkedBankAccounts > 0 ? 'VERIFIED' : 'NOT_PROVIDED',
      },
    ];

    // Generate report
    // TODO: Get actual borrower info from database
    const report = reportService.generateReport(
      user.sub,
      user.name || 'John Doe',
      'Austin',
      'TX',
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      incomeProfile,
      loanScore,
      documentVerification
    );

    // Generate PDF
    const pdfBuffer = await reportService.generatePDF(report);

    // Save to S3
    await reportService.saveReport(report, pdfBuffer);

    // Audit log
    await auditLog({
      action: 'REPORT_GENERATED',
      userId: user.sub,
      resourceType: 'REPORT',
      resourceId: report.metadata.reportId,
      requestId,
      metadata: {
        score: loanScore.overallScore,
        grade: loanScore.letterGrade,
        projectedIncome: incomeProfile.totalProjectedAnnualIncome / 100,
      },
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({
        reportId: report.metadata.reportId,
        generatedAt: report.metadata.generatedAt,
        expiresAt: report.metadata.expiresAt,
        status: report.metadata.status,
        summary: {
          projectedAnnualIncome: report.incomeOverview.projectedAnnualIncome / 100,
          loanReadinessScore: report.loanReadinessScore.score,
          letterGrade: report.loanReadinessScore.letterGrade,
          activeSourceCount: report.incomeOverview.activeSourceCount,
          trajectory: report.incomeOverview.trajectory,
        },
        qualifiedLoanTypes: loanScore.qualifiedLoanTypes,
        potentialLoanTypes: loanScore.potentialLoanTypes,
      }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
