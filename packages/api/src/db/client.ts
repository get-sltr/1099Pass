import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getDatabaseConfig } from '../config/database';
import { config } from '../config/environment';

let pool: Pool | undefined;

async function getPool(): Promise<Pool> {
  if (pool) return pool;

  const dbConfig = await getDatabaseConfig();
  pool = new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: !config.isDev() },
  });

  return pool;
}

/** Execute a parameterized query */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const p = await getPool();
  if (config.isDev()) {
    console.log('SQL:', text, params);
  }
  return p.query<T>(text, params);
}

/** Execute operations within a transaction */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const p = await getPool();
  const client = await p.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Check database connectivity */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch {
    return false;
  }
}
