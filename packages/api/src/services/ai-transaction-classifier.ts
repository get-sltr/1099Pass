/**
 * AI Transaction Classifier — Smart categorization for gig income (Haiku)
 */

import { askClaude } from './ai-service';
import type { IncomeSourceType } from './plaid-service';

export interface TransactionInput {
  name: string;
  merchantName: string | null;
  amount: number;
  category: string[];
}

export interface ClassificationResult {
  index: number;
  incomeSourceType: IncomeSourceType;
  platformName: string;
  confidence: number;
}

/**
 * Classify ambiguous transactions as gig/contractor income.
 */
export async function classifyAmbiguousTransactions(
  transactions: TransactionInput[]
): Promise<ClassificationResult[]> {
  if (transactions.length === 0) return [];

  const payload = JSON.stringify(
    transactions.map((t, i) => ({
      index: i,
      name: t.name,
      merchant: t.merchantName,
      amount: t.amount / 100,
      categories: t.category,
    }))
  );

  const raw = await askClaude(
    `Classify these bank transactions as income sources for a gig/1099 worker.
For each transaction, determine:
1. Whether it's gig/contractor income (not personal transfers, refunds, or regular employment)
2. The platform or source name
3. Income type: GIG_PLATFORM, CONTRACTOR_1099, SELF_EMPLOYMENT, INVESTMENT, RENTAL, OTHER
4. Confidence (0-1)

Transactions:
${payload}

Return a JSON array of ONLY the ones that are gig/contractor income. No other text.
Example: [{"index":0,"incomeSourceType":"GIG_PLATFORM","platformName":"Uber","confidence":0.95}]`,
    { tier: 'fast', maxTokens: 2048 }
  );

  const trimmed = raw.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*$/, ']');
  return JSON.parse(trimmed) as ClassificationResult[];
}
