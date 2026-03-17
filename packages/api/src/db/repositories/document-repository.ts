import { query } from '../client';
import type { DocumentationStatus } from '../../services/loan-score-service';

interface DocumentCountRow {
  document_type: string;
  count: string;
}

/**
 * Get documentation status for a borrower by querying uploaded documents
 * and linked bank accounts.
 */
export async function getDocumentationStatus(
  borrowerId: string
): Promise<DocumentationStatus> {
  // Count documents by type
  const docResult = await query<DocumentCountRow>(
    `SELECT document_type, COUNT(*)::text as count
     FROM documents
     WHERE borrower_id = $1 AND status IN ('PENDING', 'PROCESSING', 'VERIFIED')
     GROUP BY document_type`,
    [borrowerId]
  );

  const docCounts: Record<string, number> = {};
  for (const row of docResult.rows) {
    docCounts[row.document_type] = parseInt(row.count, 10);
  }

  // Count linked bank accounts
  const plaidResult = await query<{ count: string }>(
    `SELECT COUNT(*)::text as count FROM plaid_items WHERE borrower_id = $1 AND status = 'active'`,
    [borrowerId]
  );
  const linkedBankAccounts = parseInt(plaidResult.rows[0]?.count ?? '0', 10);

  return {
    hasTaxReturns: (docCounts['TAX_RETURN'] ?? 0) > 0,
    has1099Forms: (docCounts['FORM_1099'] ?? 0) > 0,
    hasBankStatements: (docCounts['BANK_STATEMENT'] ?? 0) > 0,
    hasW2Forms: false, // 1099Pass doesn't use W2s but the interface requires it
    hasOtherIncomeDocs: (docCounts['PROFIT_LOSS'] ?? 0) > 0 || (docCounts['OTHER'] ?? 0) > 0,
    linkedBankAccounts,
  };
}
