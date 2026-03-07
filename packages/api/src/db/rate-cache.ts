/**
 * rate_cache table access for GET /rates (read) and refresh-rates cron (write).
 * No user data; public read. Filled by scheduled Lambda every Thursday after FRED release.
 */

import { query } from './client';

export interface CachedRateRow {
  rate_type: string;
  rate_value: number | null;
  as_of_date: string | null;
  source: string;
  fetched_at: string;
}

export interface CachedRates {
  rate30yr: number | null;
  rate15yr: number | null;
  asOf: string | null;
  source: 'fred' | 'mock';
}

/** Read latest cached conventional rates. Returns null if cache empty. */
export async function getCachedRates(): Promise<CachedRates | null> {
  const result = await query<CachedRateRow>(
    `SELECT rate_type, rate_value, as_of_date, source, fetched_at
     FROM rate_cache
     WHERE rate_type IN ('conventional_30', 'conventional_15')
     ORDER BY rate_type`
  );
  if (result.rowCount === 0) return null;

  const rows = result.rows;
  const r30 = rows.find(r => r.rate_type === 'conventional_30');
  const r15 = rows.find(r => r.rate_type === 'conventional_15');
  const rate30yr = r30?.rate_value != null ? Number(r30.rate_value) : null;
  const rate15yr = r15?.rate_value != null ? Number(r15.rate_value) : null;
  const asOf = r30?.as_of_date ?? r15?.as_of_date ?? null;
  const source = (rate30yr != null || rate15yr != null) ? 'fred' as const : 'mock' as const;

  return { rate30yr, rate15yr, asOf: asOf ? String(asOf) : null, source };
}

/** Upsert rates from FRED fetch. Called by scheduled refresh Lambda. */
export async function saveCachedRates(data: {
  rate30yr: number | null;
  rate15yr: number | null;
  asOf: string | null;
  source: string;
}): Promise<void> {
  await query(
    `INSERT INTO rate_cache (rate_type, rate_value, as_of_date, source, fetched_at)
     VALUES ('conventional_30', $1, $2::DATE, $3, NOW()),
            ('conventional_15', $4, $2::DATE, $3, NOW())
     ON CONFLICT (rate_type) DO UPDATE SET
       rate_value = EXCLUDED.rate_value,
       as_of_date = EXCLUDED.as_of_date,
       source = EXCLUDED.source,
       fetched_at = NOW()`,
    [
      data.rate30yr,
      data.asOf || null,
      data.source,
      data.rate15yr,
    ]
  );
}
