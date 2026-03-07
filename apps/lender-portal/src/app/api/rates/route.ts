/**
 * GET /api/rates — dev proxy to FRED when NEXT_PUBLIC_API_URL is not set.
 * Production should use the backend GET /rates Lambda.
 * Always request file_type=json to avoid XML parsing.
 */

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

/** Per FRED terms: credit the source. */
const FRED_SOURCE_CREDIT =
  'Source: Freddie Mac, 30-Year and 15-Year Fixed Rate Mortgage Averages in the United States [MORTGAGE30US, MORTGAGE15US], retrieved from FRED, Federal Reserve Bank of St. Louis.';

async function fetchLatest(seriesId: string): Promise<{ value: number; date: string } | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;
  const url = new URL(FRED_BASE);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', key);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', '1');
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  const obs = data?.observations?.[0];
  if (!obs || obs.value === '.' || obs.value === undefined) return null;
  const value = parseFloat(obs.value);
  return Number.isFinite(value) ? { value, date: obs.date } : null;
}

const NON_QM = {
  bankStatement: { min: 0.5, max: 1.25 },
  '1099': { min: 0.75, max: 1.5 },
  pnl: { min: 1.0, max: 2.0 },
};

export async function GET() {
  try {
    const [obs30, obs15] = await Promise.all([
      fetchLatest('MORTGAGE30US'),
      fetchLatest('MORTGAGE15US'),
    ]);
    const rate30 = obs30?.value ?? 6.87;
    const rate15 = obs15?.value ?? 6.22;
    const asOf = obs30?.date ?? obs15?.date ?? new Date().toISOString().slice(0, 10);
    const source = obs30 || obs15 ? 'fred' : 'mock';

    const add = (base: number, spread: { min: number; max: number }) => ({
      min30: base + spread.min,
      max30: base + spread.max,
      min15: (obs15?.value ?? rate15) + spread.min,
      max15: (obs15?.value ?? rate15) + spread.max,
    });

    const body = {
      conventional: { rate30yr: rate30, rate15yr: rate15, asOf, source },
      nonQm: {
        bankStatement: add(rate30, NON_QM.bankStatement),
        '1099': add(rate30, NON_QM['1099']),
        pnl: add(rate30, NON_QM.pnl),
      },
      disclaimer:
        'Rates are from public sources (FRED) for educational purposes only. Not an offer or guarantee. Actual rates depend on lender and borrower.',
      sourceCredit: FRED_SOURCE_CREDIT,
    };

    return Response.json(body, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch (err) {
    console.error('Rates API error:', err);
    return Response.json(
      { error: 'Failed to fetch rates', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
