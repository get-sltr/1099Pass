/**
 * GET /rates
 * Public endpoint: returns live conventional mortgage rates from FRED and derived non-QM ranges.
 * For education only; not offers or guarantees. Actual rates depend on lender and borrower.
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { getLatestFredRates, applyNonQmSpreads } from '../../services/fred-service';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const fred = await getLatestFredRates();
    const base30 = fred.conventional30yr ?? 6.87;
    const base15 = fred.conventional15yr ?? 6.22;
    const nonQm = applyNonQmSpreads(base30, base15);

    const body = {
      conventional: {
        rate30yr: fred.conventional30yr,
        rate15yr: fred.conventional15yr,
        asOf: fred.asOf,
        source: fred.source,
      },
      nonQm: {
        bankStatement: nonQm.bankStatement,
        '1099': nonQm['1099'],
        pnl: nonQm.pnl,
      },
      disclaimer:
        'Rates are from public sources (FRED) for educational purposes only. Not an offer or guarantee. Actual rates depend on lender and borrower.',
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
