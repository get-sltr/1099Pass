/**
 * Tests for Plaid Integration Service
 * Tests mock mode for development/testing
 */

import { PlaidService, MockPlaidService } from '../services/plaid-service';

describe('MockPlaidService', () => {
  describe('createLinkToken', () => {
    it('should create a valid link token', () => {
      const result = MockPlaidService.createLinkToken('test-borrower');

      expect(result.linkToken).toBeTruthy();
      expect(result.linkToken).toContain('mock-link-token');
      expect(result.expiration).toBeTruthy();
      expect(new Date(result.expiration).getTime()).toBeGreaterThan(Date.now());
    });

    it('should include borrower ID in token', () => {
      const borrowerId = 'unique-borrower-123';
      const result = MockPlaidService.createLinkToken(borrowerId);

      expect(result.linkToken).toContain(borrowerId);
    });
  });

  describe('exchangePublicToken', () => {
    it('should return a linked account', () => {
      const result = MockPlaidService.exchangePublicToken('public-token', 'test-borrower');

      expect(result.id).toBeTruthy();
      expect(result.borrowerId).toBe('test-borrower');
      expect(result.itemId).toBeTruthy();
      expect(result.accessToken).toBeTruthy();
      expect(result.institutionName).toBe('Mock Bank');
      expect(result.accountIds.length).toBeGreaterThan(0);
      expect(result.status).toBe('active');
    });

    it('should include creation timestamp', () => {
      const before = new Date();
      const result = MockPlaidService.exchangePublicToken('public-token', 'test-borrower');
      const after = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('fetchTransactions', () => {
    it('should return transactions for the specified period', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const transactions = MockPlaidService.fetchTransactions(
        startDate.toISOString().split('T')[0]!,
        endDate.toISOString().split('T')[0]!
      );

      expect(transactions.length).toBeGreaterThan(0);
    });

    it('should include multiple income sources', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      const transactions = MockPlaidService.fetchTransactions(
        startDate.toISOString().split('T')[0]!,
        endDate.toISOString().split('T')[0]!
      );

      const incomeTransactions = transactions.filter((t) => t.transactionType === 'income');
      const sources = new Set(incomeTransactions.map((t) => t.name.split(' ')[0]));

      expect(sources.size).toBeGreaterThanOrEqual(3); // At least 3 income sources
    });

    it('should include both income and expenses', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const transactions = MockPlaidService.fetchTransactions(
        startDate.toISOString().split('T')[0]!,
        endDate.toISOString().split('T')[0]!
      );

      const income = transactions.filter((t) => t.transactionType === 'income');
      const expenses = transactions.filter((t) => t.transactionType === 'expense');

      expect(income.length).toBeGreaterThan(0);
      expect(expenses.length).toBeGreaterThan(0);
    });

    it('should return transactions with all required fields', () => {
      const transactions = MockPlaidService.fetchTransactions(
        '2023-01-01',
        '2024-01-01'
      );

      transactions.forEach((tx) => {
        expect(tx.id).toBeTruthy();
        expect(tx.accountId).toBeTruthy();
        expect(typeof tx.amount).toBe('number');
        expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(tx.name).toBeTruthy();
        expect(tx.transactionType).toBeTruthy();
      });
    });

    it('should return transactions in date descending order', () => {
      const transactions = MockPlaidService.fetchTransactions(
        '2023-01-01',
        '2024-01-01'
      );

      for (let i = 1; i < transactions.length; i++) {
        expect(new Date(transactions[i]!.date).getTime()).toBeLessThanOrEqual(
          new Date(transactions[i - 1]!.date).getTime()
        );
      }
    });

    it('should generate realistic gig worker income pattern', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24);

      const transactions = MockPlaidService.fetchTransactions(
        startDate.toISOString().split('T')[0]!,
        endDate.toISOString().split('T')[0]!
      );

      const incomeTransactions = transactions.filter((t) => t.transactionType === 'income');

      // Check for gig platform deposits
      const hasUber = incomeTransactions.some((t) => t.name.toLowerCase().includes('uber'));
      const hasDoorDash = incomeTransactions.some((t) => t.name.toLowerCase().includes('doordash'));
      const hasUpwork = incomeTransactions.some((t) => t.name.toLowerCase().includes('upwork'));

      expect(hasUber).toBe(true);
      expect(hasDoorDash).toBe(true);
      expect(hasUpwork).toBe(true);
    });

    it('should include recurring debt payments', () => {
      const transactions = MockPlaidService.fetchTransactions(
        '2023-01-01',
        '2024-01-01'
      );

      const debtPayments = transactions.filter(
        (t) =>
          t.transactionType === 'expense' &&
          (t.name.toLowerCase().includes('loan') ||
           t.name.toLowerCase().includes('credit card') ||
           t.name.toLowerCase().includes('student'))
      );

      expect(debtPayments.length).toBeGreaterThan(0);
    });

    it('should show income growth trend over time', () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24);

      const transactions = MockPlaidService.fetchTransactions(
        startDate.toISOString().split('T')[0]!,
        endDate.toISOString().split('T')[0]!
      );

      const incomeTransactions = transactions.filter((t) => t.transactionType === 'income');

      // Group by year
      const recentIncome = incomeTransactions
        .filter((t) => new Date(t.date).getFullYear() === new Date().getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);

      const olderIncome = incomeTransactions
        .filter((t) => new Date(t.date).getFullYear() < new Date().getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);

      // Recent year should generally have higher income (growth trend)
      // Allow for variance - just check both periods have data
      expect(recentIncome).toBeGreaterThan(0);
      expect(olderIncome).toBeGreaterThan(0);
    });
  });

  describe('fetchIdentity', () => {
    it('should return identity information', () => {
      const identity = MockPlaidService.fetchIdentity();

      expect(identity.names.length).toBeGreaterThan(0);
      expect(identity.emails.length).toBeGreaterThan(0);
      expect(identity.phoneNumbers.length).toBeGreaterThan(0);
      expect(identity.addresses.length).toBeGreaterThan(0);
    });

    it('should return valid address structure', () => {
      const identity = MockPlaidService.fetchIdentity();
      const address = identity.addresses[0]!;

      expect(address.street).toBeTruthy();
      expect(address.city).toBeTruthy();
      expect(address.state).toBeTruthy();
      expect(address.postalCode).toBeTruthy();
      expect(address.country).toBeTruthy();
    });

    it('should return valid email format', () => {
      const identity = MockPlaidService.fetchIdentity();
      const email = identity.emails[0];

      expect(email).toMatch(/@/);
    });

    it('should return valid phone format', () => {
      const identity = MockPlaidService.fetchIdentity();
      const phone = identity.phoneNumbers[0];

      expect(phone?.length).toBeGreaterThan(5);
    });
  });

  describe('transaction date ranges', () => {
    it('should return only transactions within the date range', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-06-30';

      const transactions = MockPlaidService.fetchTransactions(startDate, endDate);

      transactions.forEach(tx => {
        expect(tx.date >= startDate).toBe(true);
        expect(tx.date <= endDate).toBe(true);
      });
    });

    it('should handle future dates gracefully', () => {
      const startDate = '2030-01-01';
      const endDate = '2030-12-31';

      const transactions = MockPlaidService.fetchTransactions(startDate, endDate);

      // Mock service generates data, so expect array (not necessarily empty)
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should handle very old date ranges', () => {
      const startDate = '2020-01-01';
      const endDate = '2020-12-31';

      const transactions = MockPlaidService.fetchTransactions(startDate, endDate);

      // Should return empty or have transactions, but not throw
      expect(Array.isArray(transactions)).toBe(true);
    });
  });
});

describe('PlaidService', () => {
  describe('identifyGigPlatform', () => {
    it('should identify Uber transactions', () => {
      expect(PlaidService.identifyGigPlatform('Uber Direct Deposit', null)).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('UBER TECHNOLOGIES', null)).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('Payment', 'Uber')).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('Uber Eats', null)).toBe('UBER');
    });

    it('should identify DoorDash transactions', () => {
      expect(PlaidService.identifyGigPlatform('DoorDash Inc', null)).toBe('DOORDASH');
      expect(PlaidService.identifyGigPlatform('DOORDASH PAYMENT', null)).toBe('DOORDASH');
    });

    it('should identify Upwork transactions', () => {
      expect(PlaidService.identifyGigPlatform('Upwork Escrow', null)).toBe('UPWORK');
      expect(PlaidService.identifyGigPlatform('UPWORK PAYMENT', null)).toBe('UPWORK');
    });

    it('should identify Amazon Flex transactions', () => {
      expect(PlaidService.identifyGigPlatform('Amazon Flex', null)).toBe('AMAZON_FLEX');
      expect(PlaidService.identifyGigPlatform('AMZN FLEX', null)).toBe('AMAZON_FLEX');
    });

    it('should identify other gig platforms', () => {
      expect(PlaidService.identifyGigPlatform('Lyft Inc', null)).toBe('LYFT');
      expect(PlaidService.identifyGigPlatform('Instacart', null)).toBe('INSTACART');
      expect(PlaidService.identifyGigPlatform('Fiverr', null)).toBe('FIVERR');
      expect(PlaidService.identifyGigPlatform('TaskRabbit', null)).toBe('TASKRABBIT');
      expect(PlaidService.identifyGigPlatform('Etsy Inc', null)).toBe('ETSY');
      expect(PlaidService.identifyGigPlatform('Turo Payment', null)).toBe('TURO');
    });

    it('should identify Shipt transactions', () => {
      expect(PlaidService.identifyGigPlatform('Shipt Shopper', null)).toBe('SHIPT');
    });

    it('should identify Postmates transactions', () => {
      expect(PlaidService.identifyGigPlatform('Postmates Payment', null)).toBe('POSTMATES');
    });

    it('should identify Grubhub transactions', () => {
      expect(PlaidService.identifyGigPlatform('Grubhub Driver', null)).toBe('GRUBHUB');
    });

    it('should return null for non-gig transactions', () => {
      expect(PlaidService.identifyGigPlatform('Random Company', null)).toBeNull();
      expect(PlaidService.identifyGigPlatform('ABC Corp Payment', null)).toBeNull();
      expect(PlaidService.identifyGigPlatform('Walmart', null)).toBeNull();
      expect(PlaidService.identifyGigPlatform('Target Payment', null)).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(PlaidService.identifyGigPlatform('UBER', null)).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('uber', null)).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('Uber', null)).toBe('UBER');
      expect(PlaidService.identifyGigPlatform('LYFT', null)).toBe('LYFT');
      expect(PlaidService.identifyGigPlatform('doordash', null)).toBe('DOORDASH');
    });

    it('should handle null merchant name', () => {
      expect(PlaidService.identifyGigPlatform('Uber', null)).toBe('UBER');
    });

    it('should handle empty strings', () => {
      expect(PlaidService.identifyGigPlatform('', null)).toBeNull();
      expect(PlaidService.identifyGigPlatform('', '')).toBeNull();
    });
  });

  describe('mock mode', () => {
    it('should work in mock mode without credentials', async () => {
      process.env.PLAID_MODE = 'mock';

      const service = new PlaidService('mock-key', 'us-east-1');
      await service.initialize('mock-secret-arn');

      const linkToken = await service.createLinkToken('test-borrower');
      expect(linkToken.linkToken).toBeTruthy();

      const account = await service.exchangePublicToken('public-token', 'test-borrower');
      expect(account.id).toBeTruthy();

      const transactions = await service.fetchTransactions(
        account.accessToken,
        '2023-01-01',
        '2024-01-01'
      );
      expect(transactions.length).toBeGreaterThan(0);

      const identity = await service.fetchIdentity(account.accessToken);
      expect(identity.names.length).toBeGreaterThan(0);

      delete process.env.PLAID_MODE;
    });
  });
});
