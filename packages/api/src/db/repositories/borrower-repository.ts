import { query } from '../client';
import { Borrower, KYCStatus, SubscriptionTier } from '@1099pass/shared';
import { NotFoundError } from '../../middleware/error-handler';

interface BorrowerRow {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  kyc_status: string;
  subscription_tier: string;
  cognito_sub: string;
  profile_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: BorrowerRow): Borrower {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    first_name: row.first_name,
    last_name: row.last_name,
    date_of_birth: row.date_of_birth.toISOString().split('T')[0]!,
    street_address: row.street_address,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    kyc_status: row.kyc_status as KYCStatus,
    subscription_tier: row.subscription_tier as SubscriptionTier,
    cognito_sub: row.cognito_sub,
    profile_image_url: row.profile_image_url ?? undefined,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function create(data: Omit<Borrower, 'id' | 'created_at' | 'updated_at'>): Promise<Borrower> {
  const result = await query<BorrowerRow>(
    `INSERT INTO borrowers (email, phone, first_name, last_name, date_of_birth, street_address, city, state, zip_code, kyc_status, subscription_tier, cognito_sub, profile_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [data.email, data.phone, data.first_name, data.last_name, data.date_of_birth, data.street_address, data.city, data.state, data.zip_code, data.kyc_status, data.subscription_tier, data.cognito_sub, data.profile_image_url ?? null]
  );
  return mapRow(result.rows[0]!);
}

export async function findById(id: string): Promise<Borrower | null> {
  const result = await query<BorrowerRow>('SELECT * FROM borrowers WHERE id = $1', [id]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function findByEmail(email: string): Promise<Borrower | null> {
  const result = await query<BorrowerRow>('SELECT * FROM borrowers WHERE email = $1', [email]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function findByCognitoSub(cognitoSub: string): Promise<Borrower | null> {
  const result = await query<BorrowerRow>('SELECT * FROM borrowers WHERE cognito_sub = $1', [cognitoSub]);
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function update(id: string, data: Partial<Omit<Borrower, 'id' | 'created_at' | 'updated_at' | 'cognito_sub'>>): Promise<Borrower> {
  const existing = await findById(id);
  if (!existing) throw new NotFoundError('Borrower');

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (fields.length === 0) return existing;

  values.push(id);
  const result = await query<BorrowerRow>(
    `UPDATE borrowers SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return mapRow(result.rows[0]!);
}

export async function updateKycStatus(id: string, status: KYCStatus): Promise<Borrower> {
  return update(id, { kyc_status: status });
}

export async function deleteById(id: string): Promise<void> {
  const existing = await findById(id);
  if (!existing) throw new NotFoundError('Borrower');
  await query('DELETE FROM borrowers WHERE id = $1', [id]);
}
