/**
 * FRED (Federal Reserve Economic Data) API client for mortgage rate series.
 * API key: https://fred.stlouisfed.org/docs/api/api_key.html
 *
 * Essential FRED series codes (weekly refresh cron uses 30yr + 15yr only):
 *
 * | Loan Type       | FRED Series ID  | Update Frequency        |
 * |-----------------|-----------------|-------------------------|
 * | 30-Year Fixed   | MORTGAGE30US    | Weekly (Thursdays)      |
 * | 15-Year Fixed   | MORTGAGE15US    | Weekly (Thursdays)      |
 * | 5/1-Year ARM    | MORTGAGE5US     | DISCONTINUED Nov 2022   |
 * | 10-Year Treasury| DGS10           | Daily (market benchmark) |
 *
 * Warning: Freddie Mac discontinued MORTGAGE5US in late 2022. For 5/1 ARM
 * calculations use a secondary source (e.g. Bankrate or non-QM partner rate sheets).
 *
 * Data formatting: Always request file_type=json to avoid parsing XML in TypeScript.
 */

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

export interface FredObservation {
  date: string;
  value: string;
}

export interface FredRates {
  conventional30yr: number | null;
  conventional15yr: number | null;
  asOf: string | null;
  source: 'fred' | 'mock';
}

/** Non-QM spread ranges (percentage points above conventional). Build doc: bank statement, 1099, P&L. */
const NON_QM_SPREADS = {
  bankStatement: { min: 0.5, max: 1.25 },
  '1099': { min: 0.75, max: 1.5 },
  pnl: { min: 1.0, max: 2.0 },
} as const;

async function fetchSeries(apiKey: string, seriesId: string): Promise<FredObservation | null> {
  const url = new URL(FRED_BASE);
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json'); // Required: avoid XML parsing in TypeScript
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const data = await res.json();
  const obs = data?.observations?.[0];
  if (!obs || obs.value === '.' || obs.value === undefined) return null;
  return { date: obs.date, value: String(obs.value) };
}

/**
 * Fetch latest conventional 30-year and 15-year mortgage rates from FRED.
 * Returns mock data if FRED_API_KEY is not set (e.g. local dev).
 */
export async function getLatestFredRates(apiKey?: string): Promise<FredRates> {
  const key = apiKey ?? process.env.FRED_API_KEY;

  if (!key) {
    return {
      conventional30yr: 6.87,
      conventional15yr: 6.22,
      asOf: new Date().toISOString().slice(0, 10),
      source: 'mock',
    };
  }

  const [obs30, obs15] = await Promise.all([
    fetchSeries(key, 'MORTGAGE30US'),
    fetchSeries(key, 'MORTGAGE15US'),
  ]);

  const parse = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const conventional30yr = obs30 ? parse(obs30.value) : null;
  const conventional15yr = obs15 ? parse(obs15.value) : null;
  const asOf = obs30?.date ?? obs15?.date ?? null;

  return {
    conventional30yr,
    conventional15yr,
    asOf,
    source: (conventional30yr !== null || conventional15yr !== null) ? 'fred' : 'mock',
  };
}

export function getNonQmSpreads() {
  return NON_QM_SPREADS;
}

export function applyNonQmSpreads(
  base30: number | null,
  base15: number | null
): {
  bankStatement: { min30: number | null; max30: number | null; min15: number | null; max15: number | null };
  '1099': { min30: number | null; max30: number | null; min15: number | null; max15: number | null };
  pnl: { min30: number | null; max30: number | null; min15: number | null; max15: number | null };
} {
  const add = (base: number | null, spread: { min: number; max: number }) =>
    base !== null
      ? { min: base + spread.min, max: base + spread.max }
      : { min: null, max: null };

  const b30 = add(base30, NON_QM_SPREADS.bankStatement);
  const b15 = add(base15, NON_QM_SPREADS.bankStatement);
  const n30 = add(base30, NON_QM_SPREADS['1099']);
  const n15 = add(base15, NON_QM_SPREADS['1099']);
  const p30 = add(base30, NON_QM_SPREADS.pnl);
  const p15 = add(base15, NON_QM_SPREADS.pnl);

  return {
    bankStatement: { min30: b30.min, max30: b30.max, min15: b15.min, max15: b15.max },
    '1099': { min30: n30.min, max30: n30.max, min15: n15.min, max15: n15.max },
    pnl: { min30: p30.min, max30: p30.max, min15: p15.min, max15: p15.max },
  };
}
