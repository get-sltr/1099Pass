/**
 * AI Report Narrator — Enhanced income narrative for lender reports (Sonnet)
 */

import { askClaude } from './ai-service';
import type { NormalizedIncomeProfile } from './income-normalization-service';

/**
 * Generate a 3–4 paragraph income verification narrative for underwriters.
 */
export async function generateIncomeNarrative(
  profile: NormalizedIncomeProfile
): Promise<string> {
  const m = profile.stabilityMetrics;
  const proj = profile.annualizedProjection;
  const dti = profile.debtAnalysis?.estimatedDTI;
  const sourceNames = profile.incomeSources.map(
    (s) => s.gigPlatform || s.name
  );

  return askClaude(
    `You are a financial data analyst writing for mortgage underwriters.
Given this normalized income profile for a gig/1099 worker, write a 3-4 paragraph
income verification narrative that a loan officer would include in an underwriting file.

Data:
- Projected annual income: $${(proj.finalProjection / 100).toFixed(2)}
- Income sources: ${sourceNames.join(', ')}
- Stability (CoV): ${m.coefficientOfVariation.toFixed(3)}
- Trajectory: ${m.trajectory}
- YoY growth: ${m.yearOverYearGrowthRate.toFixed(1)}%
- Income diversity score: ${m.incomeDiversityScore.toFixed(2)}
- DTI ratio: ${dti != null ? dti.toFixed(3) : 'N/A'}
- Months of verified history: ${profile.monthsAnalyzed}

Tone: Professional, factual, confident where data supports it, appropriately cautious where it doesn't.
Do NOT make claims about creditworthiness. State facts about income patterns only.`,
    { tier: 'smart', maxTokens: 1024 }
  );
}
