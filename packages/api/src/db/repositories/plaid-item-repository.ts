import { query } from '../client';

export interface PlaidItemRow {
  id: string;
  borrower_id: string;
  item_id: string;
  encrypted_access_token: string;
  institution_id: string;
  institution_name: string;
  account_ids: string[];
  consent_expires_at: Date | null;
  last_synced_at: Date | null;
  status: 'active' | 'requires_reauth' | 'disconnected';
  created_at: Date;
  updated_at: Date;
}

export interface CreatePlaidItemInput {
  id: string;
  borrower_id: string;
  item_id: string;
  encrypted_access_token: string;
  institution_id: string;
  institution_name: string;
  account_ids: string[];
  consent_expires_at?: Date | null;
  status?: 'active' | 'requires_reauth' | 'disconnected';
}

export async function create(data: CreatePlaidItemInput): Promise<PlaidItemRow> {
  const result = await query<PlaidItemRow>(
    `INSERT INTO plaid_items (id, borrower_id, item_id, encrypted_access_token, institution_id, institution_name, account_ids, consent_expires_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.id,
      data.borrower_id,
      data.item_id,
      data.encrypted_access_token,
      data.institution_id,
      data.institution_name,
      JSON.stringify(data.account_ids),
      data.consent_expires_at ?? null,
      data.status ?? 'active',
    ]
  );
  return result.rows[0]!;
}

export async function findByBorrowerId(borrowerId: string): Promise<PlaidItemRow[]> {
  const result = await query<PlaidItemRow>(
    'SELECT * FROM plaid_items WHERE borrower_id = $1 AND status = $2 ORDER BY created_at DESC',
    [borrowerId, 'active']
  );
  return result.rows;
}

export async function findById(id: string): Promise<PlaidItemRow | null> {
  const result = await query<PlaidItemRow>(
    'SELECT * FROM plaid_items WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findByItemId(itemId: string): Promise<PlaidItemRow | null> {
  const result = await query<PlaidItemRow>(
    'SELECT * FROM plaid_items WHERE item_id = $1',
    [itemId]
  );
  return result.rows[0] ?? null;
}

export async function updateLastSynced(id: string): Promise<void> {
  await query(
    'UPDATE plaid_items SET last_synced_at = NOW() WHERE id = $1',
    [id]
  );
}

export async function updateStatus(id: string, status: PlaidItemRow['status']): Promise<void> {
  await query(
    'UPDATE plaid_items SET status = $1 WHERE id = $2',
    [status, id]
  );
}

export async function deleteByBorrowerId(borrowerId: string): Promise<void> {
  await query('DELETE FROM plaid_items WHERE borrower_id = $1', [borrowerId]);
}
