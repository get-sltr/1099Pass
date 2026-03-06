/**
 * AI Matching Service — Smart lender ranking for borrower fit (Sonnet)
 */

import { askClaude } from './ai-service';
import type { NormalizedIncomeProfile } from './income-normalization-service';
import type { LoanReadinessScore } from './loan-score-service';

/** Minimal lender + criteria for AI ranking (caller maps from DB) */
export interface LenderMatchInput {
  lender: {
    id: string;
    institution_name: string;
    lender_type: string;
  };
  criteria: {
    loan_types: string[];
    min_annual_income: number;
    accepted_gig_platforms: string[];
  };
  basicMatchScore: number;
}

export interface LenderRankResult {
  lenderId: string;
  aiScore: number;
  reasoning: string;
}

/**
 * Re-rank matching lenders by fit for this borrower (Professional/Enterprise tiers).
 */
export async function rankLenderMatches(
  borrowerProfile: NormalizedIncomeProfile,
  loanScore: LoanReadinessScore,
  matchingLenders: LenderMatchInput[]
): Promise<LenderRankResult[]> {
  if (matchingLenders.length === 0) return [];

  const proj = borrowerProfile.annualizedProjection;
  const sourceSummary = borrowerProfile.incomeSources
    .map(
      (s) =>
        `${s.gigPlatform || s.name} ($${(s.totalIncomeCents / 100).toFixed(0)}/yr)`
    )
    .join(', ');

  const lendersPayload = JSON.stringify(
    matchingLenders.map((m) => ({
      id: m.lender.id,
      name: m.lender.institution_name,
      type: m.lender.lender_type,
      loanTypes: m.criteria.loan_types,
      minIncome: m.criteria.min_annual_income,
      platforms: m.criteria.accepted_gig_platforms,
      basicScore: m.basicMatchScore,
    }))
  );

  const raw = await askClaude(
    `You are analyzing borrower-lender fit for a gig worker income verification platform.

Borrower Profile:
- Annual income: $${proj.finalProjection / 100}
- Sources: ${sourceSummary}
- Stability: ${borrowerProfile.stabilityMetrics.trajectory}
- Loan Readiness Score: ${loanScore.overallScore} (${loanScore.letterGrade})
- Qualified loan types: ${loanScore.qualifiedLoanTypes.join(', ')}

Lenders to rank (with their criteria):
${lendersPayload}

For each lender, score 0-100 on likelihood of good fit and give a one-sentence reasoning.
Consider: income type alignment, lender specialization, borrower strength areas.
Return only a JSON array: [{ "lenderId": "...", "aiScore": 85, "reasoning": "..." }]`,
    { tier: 'smart', maxTokens: 2048 }
  );

  const trimmed = raw.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*$/, ']');
  return JSON.parse(trimmed) as LenderRankResult[];
}
