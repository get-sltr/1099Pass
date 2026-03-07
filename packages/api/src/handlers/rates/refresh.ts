/**
 * Scheduled Lambda: fetch latest rates from FRED and write to rate_cache table.
 * Trigger: EventBridge rule every Thursday at 1:00 PM ET (after 12:00 PM ET FRED release).
 * FRED key from Secrets Manager. Stays under 30 requests/minute limit.
 *
 * Series used: MORTGAGE30US (30-yr fixed), MORTGAGE15US (15-yr fixed) only.
 * MORTGAGE5US (5/1 ARM) is discontinued as of Nov 2022; for ARM use a secondary source.
 */

import { ScheduledHandler } from 'aws-lambda';
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getSecretsManagerClient } from '../../config/aws';
import { getLatestFredRates } from '../../services/fred-service';
import { saveCachedRates } from '../../db/rate-cache';

async function getFredApiKey(secretArn: string): Promise<string | undefined> {
  try {
    const client = getSecretsManagerClient();
    const res = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));
    const raw = res.SecretString?.trim();
    return raw && raw.length > 0 ? raw : undefined;
  } catch {
    return undefined;
  }
}

export const handler: ScheduledHandler = async () => {
  const fredSecretArn = process.env.FRED_SECRET_ARN;
  const apiKey = fredSecretArn ? await getFredApiKey(fredSecretArn) : undefined;
  const fred = await getLatestFredRates(apiKey);

  await saveCachedRates({
    rate30yr: fred.conventional30yr,
    rate15yr: fred.conventional15yr,
    asOf: fred.asOf,
    source: fred.source === 'fred' ? 'fred_api' : 'mock',
  });
};
