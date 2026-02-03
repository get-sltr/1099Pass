import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { getSecretsManagerClient } from './aws';
import { config } from './environment';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

let cachedConfig: DbConfig | undefined;

/** Fetch database credentials from Secrets Manager */
export async function getDatabaseConfig(): Promise<DbConfig> {
  if (cachedConfig) return cachedConfig;

  const client = getSecretsManagerClient();
  const response = await client.send(new GetSecretValueCommand({
    SecretId: config.dbSecretArn,
  }));

  if (!response.SecretString) throw new Error('Database secret is empty');

  const secret = JSON.parse(response.SecretString) as {
    host: string;
    port: number;
    dbname: string;
    username: string;
    password: string;
  };

  cachedConfig = {
    host: secret.host,
    port: secret.port,
    database: secret.dbname,
    username: secret.username,
    password: secret.password,
  };

  return cachedConfig;
}
