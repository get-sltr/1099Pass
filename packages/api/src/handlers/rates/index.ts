/**
 * GET /rates
 * Public endpoint: returns conventional and non-QM mortgage rates from rate_cache (PostgreSQL).
 * Rates are updated by a scheduled Lambda every Thursday afternoon (after 12:00 PM ET FRED release).
 * No FRED calls on user request. If cache is empty, returns mock data.
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { getCachedRates } from '../../db/rate-cache';
import { applyNonQmSpreads } from '../../services/fred-service';

/** Per FRED terms: credit the source. */
const FRED_SOURCE_CREDIT =
  'Source: Freddie Mac, 30-Year and 15-Year Fixed Rate Mortgage Averages in the United States [MORTGAGE30US, MORTGAGE15US], retrieved from FRED, Federal Reserve Bank of St. Louis.';

const MOCK_RATE_30 = 6.87;
const MOCK_RATE_15 = 6.22;

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const cached = await getCachedRates();
    const rate30yr = cached?.rate30yr ?? MOCK_RATE_30;
    const rate15yr = cached?.rate15yr ?? MOCK_RATE_15;
    const asOf = cached?.asOf ?? new Date().toISOString().slice(0, 10);
    const source = cached?.source ?? 'mock';
    const base30 = rate30yr ?? MOCK_RATE_30;
    const base15 = rate15yr ?? MOCK_RATE_15;
    const nonQm = applyNonQmSpreads(base30, base15);

    const body = {
      conventional: {
        rate30yr: rate30yr ?? null,
        rate15yr: rate15yr ?? null,
        asOf,
        source,
      },
      nonQm: {
        bankStatement: nonQm.bankStatement,
        '1099': nonQm['1099'],
        pnl: nonQm.pnl,
      },
      disclaimer:
        'Rates are from public sources (FRED) for educational purposes only. Not an offer or guarantee. Actual rates depend on lender and borrower.',
      sourceCredit: FRED_SOURCE_CREDIT,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(body),
    };
  } catch (err) {
    console.error('Rates handler error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to fetch rates',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
    };
  }
};
