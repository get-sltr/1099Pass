/**
 * Tests for database repositories
 * Mocks the db client to test repository logic without a real database
 */

import * as plaidItemRepo from '../db/repositories/plaid-item-repository';
import * as financialProfileRepo from '../db/repositories/financial-profile-repository';
import * as documentRepo from '../db/repositories/document-repository';
import * as borrowerRepo from '../db/repositories/borrower-repository';

// Mock the database client
jest.mock('../db/client', () => ({
  query: jest.fn(),
}));

import { query } from '../db/client';
const mockQuery = query as jest.MockedFunction<typeof query>;

beforeEach(() => {
  mockQuery.mockReset();
});

// ─── Plaid Item Repository ───

describe('plaid-item-repository', () => {
  const samplePlaidItem = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    borrower_id: '550e8400-e29b-41d4-a716-446655440000',
    item_id: 'plaid-item-abc123',
    encrypted_access_token: 'encrypted-token-xyz',
    institution_id: 'ins_001',
    institution_name: 'Chase',
    account_ids: ['acct-1', 'acct-2'],
    consent_expires_at: null,
    last_synced_at: null,
    status: 'active' as const,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  };

  describe('create', () => {
    it('should insert a plaid item and return it', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [samplePlaidItem],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      });

      const result = await plaidItemRepo.create({
        id: samplePlaidItem.id,
        borrower_id: samplePlaidItem.borrower_id,
        item_id: samplePlaidItem.item_id,
        encrypted_access_token: samplePlaidItem.encrypted_access_token,
        institution_id: samplePlaidItem.institution_id,
        institution_name: samplePlaidItem.institution_name,
        account_ids: samplePlaidItem.account_ids,
      });

      expect(result.id).toBe(samplePlaidItem.id);
      expect(result.institution_name).toBe('Chase');
      expect(mockQuery).toHaveBeenCalledTimes(1);

      const [sql, params] = mockQuery.mock.calls[0]!;
      expect(sql).toContain('INSERT INTO plaid_items');
      expect(params).toContain(samplePlaidItem.id);
      expect(params).toContain(samplePlaidItem.encrypted_access_token);
    });
  });

  describe('findByBorrowerId', () => {
    it('should return active plaid items for a borrower', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [samplePlaidItem],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const result = await plaidItemRepo.findByBorrowerId(samplePlaidItem.borrower_id);

      expect(result).toHaveLength(1);
      expect(result[0]!.institution_name).toBe('Chase');
      const [sql, params] = mockQuery.mock.calls[0]!;
      expect(sql).toContain('status');
      expect(params).toContain('active');
    });

    it('should return empty array when no accounts linked', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const result = await plaidItemRepo.findByBorrowerId('no-accounts-borrower');
      expect(result).toHaveLength(0);
    });
  });

  describe('updateLastSynced', () => {
    it('should update the last_synced_at timestamp', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      });

      await plaidItemRepo.updateLastSynced(samplePlaidItem.id);

      const [sql] = mockQuery.mock.calls[0]!;
      expect(sql).toContain('last_synced_at = NOW()');
    });
  });

  describe('updateStatus', () => {
    it('should update the status', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: [],
      });

      await plaidItemRepo.updateStatus(samplePlaidItem.id, 'requires_reauth');

      const [, params] = mockQuery.mock.calls[0]!;
      expect(params).toContain('requires_reauth');
    });
  });
});

// ─── Financial Profile Repository ───

describe('financial-profile-repository', () => {
  const sampleProfile = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    borrower_id: '550e8400-e29b-41d4-a716-446655440000',
    total_annual_income: '72000.00',
    income_sources: [{ name: 'Uber', monthlyAverage: 3000 }],
    monthly_average: '6000.00',
    income_trend: 'INCREASING',
    debt_to_income_ratio: '0.3200',
    loan_readiness_score: 78,
    credit_score_range: null,
    last_synced: new Date('2025-06-01'),
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-06-01'),
  };

  describe('upsert', () => {
    it('should insert or update a financial profile', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [sampleProfile],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      });

      const result = await financialProfileRepo.upsert({
        borrower_id: sampleProfile.borrower_id,
        total_annual_income: 72000,
        income_sources: sampleProfile.income_sources,
        monthly_average: 6000,
        income_trend: 'INCREASING',
        debt_to_income_ratio: 0.32,
        loan_readiness_score: 78,
      });

      expect(result.loan_readiness_score).toBe(78);
      const [sql] = mockQuery.mock.calls[0]!;
      expect(sql).toContain('ON CONFLICT (borrower_id) DO UPDATE');
    });
  });

  describe('findByBorrowerId', () => {
    it('should return profile when exists', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [sampleProfile],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const result = await financialProfileRepo.findByBorrowerId(sampleProfile.borrower_id);
      expect(result).not.toBeNull();
      expect(result!.income_trend).toBe('INCREASING');
    });

    it('should return null when not found', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const result = await financialProfileRepo.findByBorrowerId('nonexistent');
      expect(result).toBeNull();
    });
  });
});

// ─── Document Repository ───

describe('document-repository', () => {
  describe('getDocumentationStatus', () => {
    it('should return correct status when documents exist', async () => {
      // First call: document counts
      mockQuery.mockResolvedValueOnce({
        rows: [
          { document_type: 'TAX_RETURN', count: '2' },
          { document_type: 'FORM_1099', count: '3' },
          { document_type: 'BANK_STATEMENT', count: '6' },
        ],
        rowCount: 3,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      // Second call: plaid item count
      mockQuery.mockResolvedValueOnce({
        rows: [{ count: '2' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const status = await documentRepo.getDocumentationStatus('borrower-123');

      expect(status.hasTaxReturns).toBe(true);
      expect(status.has1099Forms).toBe(true);
      expect(status.hasBankStatements).toBe(true);
      expect(status.hasW2Forms).toBe(false);
      expect(status.hasOtherIncomeDocs).toBe(false);
      expect(status.linkedBankAccounts).toBe(2);
    });

    it('should return all false when no documents', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });
      mockQuery.mockResolvedValueOnce({
        rows: [{ count: '0' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const status = await documentRepo.getDocumentationStatus('new-borrower');

      expect(status.hasTaxReturns).toBe(false);
      expect(status.has1099Forms).toBe(false);
      expect(status.hasBankStatements).toBe(false);
      expect(status.linkedBankAccounts).toBe(0);
    });

    it('should detect other income docs (P&L)', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ document_type: 'PROFIT_LOSS', count: '1' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });
      mockQuery.mockResolvedValueOnce({
        rows: [{ count: '0' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const status = await documentRepo.getDocumentationStatus('borrower-456');
      expect(status.hasOtherIncomeDocs).toBe(true);
    });
  });
});

// ─── Borrower Repository (getIdByCognitoSub) ───

describe('borrower-repository', () => {
  describe('getIdByCognitoSub', () => {
    it('should return borrower id for known cognito sub', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '550e8400-e29b-41d4-a716-446655440000' }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const id = await borrowerRepo.getIdByCognitoSub('cognito-sub-abc');
      expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return null for unknown cognito sub', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      });

      const id = await borrowerRepo.getIdByCognitoSub('unknown-sub');
      expect(id).toBeNull();
    });
  });
});
