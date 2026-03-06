/**
 * POST /ai/chat
 * Borrower coach chat — score explanation and advice (Cognito, borrower only)
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import * as borrowerRepository from '../../db/repositories/borrower-repository';
import { createPlaidService } from '../../services/plaid-service';
import { incomeNormalizationService } from '../../services/income-normalization-service';
import { loanScoreService, type DocumentationStatus } from '../../services/loan-score-service';
import { chatWithCoach, type CoachContext } from '../../services/ai-borrower-coach';
import { validateRequest } from '../../middleware/request-validator';
import { withErrorHandler } from '../../middleware/error-handler';
import { requireRole, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { auditLog } from '../../middleware/audit-logger';

const RequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .max(20)
    .optional()
    .default([]),
});

async function handleChat(
  event: AuthenticatedEvent,
  _context: unknown
): Promise<APIGatewayProxyResult> {
  const { body, user, requestId } = event;

  const validation = validateRequest(RequestSchema, body);
  if (!validation.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Invalid request', details: validation.error }),
    };
  }

  const borrower = await borrowerRepository.findByCognitoSub(user.cognitoSub);
  if (!borrower) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Borrower profile not found' }),
    };
  }

  // Build coach context: try to get real score, else defaults
  let context: CoachContext = {
    score: 0,
    grade: 'N/A',
    components: [],
    recommendations: [],
  };

  try {
    const plaidService = createPlaidService(
      process.env.KMS_KEY_ID || '',
      process.env.AWS_REGION
    );
    await plaidService.initialize(process.env.PLAID_SECRET_ARN || '');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);
    const transactions = await plaidService.fetchTransactions(
      'mock-token',
      startDate.toISOString().split('T')[0]!,
      endDate.toISOString().split('T')[0]!
    );
    const incomeProfile = incomeNormalizationService.normalizeIncome(
      user.cognitoSub,
      transactions,
      24
    );
    const documentationStatus: DocumentationStatus = {
      hasTaxReturns: false,
      has1099Forms: false,
      hasBankStatements: true,
      hasW2Forms: false,
      hasOtherIncomeDocs: false,
      linkedBankAccounts: 1,
    };
    const loanScore = loanScoreService.calculateScore(
      incomeProfile,
      documentationStatus
    );
    context = {
      score: loanScore.overallScore,
      grade: loanScore.letterGrade,
      components: Object.values(loanScore.breakdown),
      recommendations: loanScore.recommendations,
    };
  } catch {
    // Use default context if score cannot be computed (e.g. no Plaid link)
  }

  const reply = await chatWithCoach(
    validation.data.message,
    validation.data.history ?? [],
    context
  );

  await auditLog({
    action: 'AI_CHAT',
    userId: user.cognitoSub,
    resourceType: 'AI_COACH',
    resourceId: borrower.id,
    requestId,
    metadata: { model: 'claude-sonnet' },
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
    body: JSON.stringify({ reply }),
  };
}

export const handler = withErrorHandler(requireRole('BORROWER')(handleChat));
