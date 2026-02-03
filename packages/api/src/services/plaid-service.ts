/**
 * Plaid Integration Service
 * Handles bank account connections, transaction fetching, and income data retrieval
 * Supports mock mode for development/testing
 */

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
  type Transaction,
  type AccountBase,
  type LinkTokenCreateRequest,
  type ItemPublicTokenExchangeRequest,
  type TransactionsGetRequest,
  type IdentityGetRequest,
} from 'plaid';
import { v4 as uuidv4 } from 'uuid';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Types
export interface PlaidCredentials {
  clientId: string;
  secret: string;
  environment: 'sandbox' | 'development' | 'production';
}

export interface LinkedAccount {
  id: string;
  borrowerId: string;
  itemId: string;
  accessToken: string; // Encrypted with KMS
  institutionId: string;
  institutionName: string;
  accountIds: string[];
  consentExpiresAt: Date | null;
  lastSyncedAt: Date | null;
  status: 'active' | 'requires_reauth' | 'disconnected';
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaidTransaction {
  id: string;
  accountId: string;
  amount: number; // In cents (positive = income, negative = expense)
  date: string; // YYYY-MM-DD
  name: string;
  merchantName: string | null;
  category: string[];
  pending: boolean;
  transactionType: 'income' | 'expense' | 'transfer';
  incomeSourceType: IncomeSourceType | null;
}

export type IncomeSourceType =
  | 'GIG_PLATFORM'
  | 'CONTRACTOR_1099'
  | 'SELF_EMPLOYMENT'
  | 'INVESTMENT'
  | 'RENTAL'
  | 'OTHER';

export interface PlaidIdentity {
  names: string[];
  emails: string[];
  phoneNumbers: string[];
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}

export interface SyncResult {
  accountId: string;
  transactionsAdded: number;
  transactionsModified: number;
  transactionsRemoved: number;
  lastSyncedAt: Date;
}

// Known gig platform identifiers for transaction categorization
const GIG_PLATFORM_PATTERNS: Record<string, string[]> = {
  UBER: ['uber', 'uber technologies', 'uber trip', 'uber eats'],
  LYFT: ['lyft', 'lyft inc'],
  DOORDASH: ['doordash', 'door dash'],
  GRUBHUB: ['grubhub', 'grub hub'],
  INSTACART: ['instacart', 'maplebear'],
  AMAZON_FLEX: ['amazon flex', 'amzn flex', 'amazon logistics'],
  TASKRABBIT: ['taskrabbit', 'task rabbit'],
  FIVERR: ['fiverr'],
  UPWORK: ['upwork', 'upwork escrow'],
  ETSY: ['etsy', 'etsy inc'],
  SHOPIFY: ['shopify'],
  ROVER: ['rover.com', 'rover'],
  TURO: ['turo'],
  AIRBNB: ['airbnb'],
  POSTMATES: ['postmates'],
  SHIPT: ['shipt'],
};

/**
 * Plaid Service - handles all Plaid API interactions
 */
export class PlaidService {
  private client: PlaidApi | null = null;
  private kmsClient: KMSClient;
  private secretsClient: SecretsManagerClient;
  private kmsKeyId: string;
  private mode: 'sandbox' | 'production' | 'mock';

  constructor(kmsKeyId: string, region: string = 'us-east-1') {
    this.kmsKeyId = kmsKeyId;
    this.kmsClient = new KMSClient({ region });
    this.secretsClient = new SecretsManagerClient({ region });
    this.mode = (process.env.PLAID_MODE as 'sandbox' | 'production' | 'mock') || 'mock';
  }

  /**
   * Initialize the Plaid client with credentials from Secrets Manager
   */
  async initialize(secretArn: string): Promise<void> {
    if (this.mode === 'mock') {
      console.log('Plaid service initialized in MOCK mode');
      return;
    }

    const credentials = await this.getPlaidCredentials(secretArn);
    const configuration = new Configuration({
      basePath: PlaidEnvironments[credentials.environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': credentials.clientId,
          'PLAID-SECRET': credentials.secret,
        },
      },
    });

    this.client = new PlaidApi(configuration);
    console.log(`Plaid service initialized in ${credentials.environment} mode`);
  }

  /**
   * Get Plaid credentials from Secrets Manager
   */
  private async getPlaidCredentials(secretArn: string): Promise<PlaidCredentials> {
    const response = await this.secretsClient.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    if (!response.SecretString) {
      throw new Error('Plaid credentials not found in Secrets Manager');
    }

    const secret = JSON.parse(response.SecretString);
    return {
      clientId: secret.clientId,
      secret: secret.secret,
      environment: secret.environment || 'sandbox',
    };
  }

  /**
   * Create a Link token for initiating Plaid Link in the mobile app
   */
  async createLinkToken(
    borrowerId: string,
    clientName: string = '1099Pass'
  ): Promise<{ linkToken: string; expiration: string }> {
    if (this.mode === 'mock') {
      return MockPlaidService.createLinkToken(borrowerId);
    }

    if (!this.client) {
      throw new Error('Plaid client not initialized');
    }

    const request: LinkTokenCreateRequest = {
      user: { client_user_id: borrowerId },
      client_name: clientName,
      products: [Products.Transactions, Products.Identity],
      country_codes: [CountryCode.Us],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    };

    const response = await this.client.linkTokenCreate(request);
    return {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
    };
  }

  /**
   * Exchange a public token for an access token after user completes Plaid Link
   */
  async exchangePublicToken(
    publicToken: string,
    borrowerId: string
  ): Promise<LinkedAccount> {
    if (this.mode === 'mock') {
      return MockPlaidService.exchangePublicToken(publicToken, borrowerId);
    }

    if (!this.client) {
      throw new Error('Plaid client not initialized');
    }

    const request: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    };

    const response = await this.client.itemPublicTokenExchange(request);
    const { access_token, item_id } = response.data;

    // Encrypt the access token before storage
    const encryptedToken = await this.encryptAccessToken(access_token);

    // Get institution info
    const itemResponse = await this.client.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id || 'unknown';

    // Get accounts
    const accountsResponse = await this.client.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;

    // Get institution name
    let institutionName = 'Unknown Institution';
    if (institutionId !== 'unknown') {
      try {
        const instResponse = await this.client.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        });
        institutionName = instResponse.data.institution.name;
      } catch {
        // Ignore institution name lookup failures
      }
    }

    return {
      id: uuidv4(),
      borrowerId,
      itemId: item_id,
      accessToken: encryptedToken,
      institutionId,
      institutionName,
      accountIds: accounts.map((a: AccountBase) => a.account_id),
      consentExpiresAt: null,
      lastSyncedAt: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Fetch transactions for a linked account (last 24 months)
   */
  async fetchTransactions(
    encryptedAccessToken: string,
    startDate: string,
    endDate: string
  ): Promise<PlaidTransaction[]> {
    if (this.mode === 'mock') {
      return MockPlaidService.fetchTransactions(startDate, endDate);
    }

    if (!this.client) {
      throw new Error('Plaid client not initialized');
    }

    const accessToken = await this.decryptAccessToken(encryptedAccessToken);
    const transactions: PlaidTransaction[] = [];
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: {
          count: 500,
          offset,
        },
      };

      const response = await this.retryWithBackoff(() =>
        this.client!.transactionsGet(request)
      );

      for (const tx of response.data.transactions) {
        transactions.push(this.transformTransaction(tx));
      }

      hasMore = transactions.length < response.data.total_transactions;
      offset = transactions.length;
    }

    return transactions;
  }

  /**
   * Fetch identity information for verification
   */
  async fetchIdentity(encryptedAccessToken: string): Promise<PlaidIdentity> {
    if (this.mode === 'mock') {
      return MockPlaidService.fetchIdentity();
    }

    if (!this.client) {
      throw new Error('Plaid client not initialized');
    }

    const accessToken = await this.decryptAccessToken(encryptedAccessToken);
    const request: IdentityGetRequest = { access_token: accessToken };
    const response = await this.client.identityGet(request);

    const identity: PlaidIdentity = {
      names: [],
      emails: [],
      phoneNumbers: [],
      addresses: [],
    };

    for (const account of response.data.accounts) {
      for (const owner of account.owners || []) {
        identity.names.push(...owner.names);
        identity.emails.push(...owner.emails.map((e) => e.data));
        identity.phoneNumbers.push(...owner.phone_numbers.map((p) => p.data));
        for (const addr of owner.addresses) {
          identity.addresses.push({
            street: addr.data.street || '',
            city: addr.data.city || '',
            state: addr.data.region || '',
            postalCode: addr.data.postal_code || '',
            country: addr.data.country || 'US',
          });
        }
      }
    }

    return identity;
  }

  /**
   * Transform Plaid transaction to our internal format
   */
  private transformTransaction(tx: Transaction): PlaidTransaction {
    // Plaid uses negative amounts for credits (income), positive for debits
    // We flip this: positive = income, negative = expense
    const amount = Math.round(-tx.amount * 100); // Convert to cents
    const isIncome = amount > 0;

    let transactionType: 'income' | 'expense' | 'transfer' = 'expense';
    let incomeSourceType: IncomeSourceType | null = null;

    if (isIncome) {
      transactionType = 'income';
      incomeSourceType = this.categorizeIncomeSource(tx.name, tx.merchant_name ?? null);
    } else if (tx.category?.includes('Transfer')) {
      transactionType = 'transfer';
    }

    return {
      id: tx.transaction_id,
      accountId: tx.account_id,
      amount,
      date: tx.date,
      name: tx.name,
      merchantName: tx.merchant_name ?? null,
      category: tx.category || [],
      pending: tx.pending,
      transactionType,
      incomeSourceType,
    };
  }

  /**
   * Categorize an income transaction by source
   */
  private categorizeIncomeSource(
    name: string,
    merchantName: string | null
  ): IncomeSourceType {
    const searchText = `${name} ${merchantName || ''}`.toLowerCase();

    // Check for known gig platforms
    for (const [, patterns] of Object.entries(GIG_PLATFORM_PATTERNS)) {
      for (const pattern of patterns) {
        if (searchText.includes(pattern)) {
          return 'GIG_PLATFORM';
        }
      }
    }

    // Check for other income types
    if (
      searchText.includes('dividend') ||
      searchText.includes('interest') ||
      searchText.includes('investment')
    ) {
      return 'INVESTMENT';
    }

    if (
      searchText.includes('rent') ||
      searchText.includes('rental') ||
      searchText.includes('lease')
    ) {
      return 'RENTAL';
    }

    // Default to contractor/self-employment for other income
    return 'CONTRACTOR_1099';
  }

  /**
   * Encrypt access token with KMS
   */
  private async encryptAccessToken(token: string): Promise<string> {
    const response = await this.kmsClient.send(
      new EncryptCommand({
        KeyId: this.kmsKeyId,
        Plaintext: Buffer.from(token),
      })
    );

    if (!response.CiphertextBlob) {
      throw new Error('Failed to encrypt access token');
    }

    return Buffer.from(response.CiphertextBlob).toString('base64');
  }

  /**
   * Decrypt access token with KMS
   */
  private async decryptAccessToken(encryptedToken: string): Promise<string> {
    const response = await this.kmsClient.send(
      new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedToken, 'base64'),
      })
    );

    if (!response.Plaintext) {
      throw new Error('Failed to decrypt access token');
    }

    return Buffer.from(response.Plaintext).toString('utf-8');
  }

  /**
   * Retry with exponential backoff for Plaid API calls
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          const delay = baseDelayMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get the specific gig platform from transaction data
   */
  static identifyGigPlatform(name: string, merchantName: string | null): string | null {
    const searchText = `${name} ${merchantName || ''}`.toLowerCase();

    for (const [platform, patterns] of Object.entries(GIG_PLATFORM_PATTERNS)) {
      for (const pattern of patterns) {
        if (searchText.includes(pattern)) {
          return platform;
        }
      }
    }

    return null;
  }
}

/**
 * Mock Plaid Service for development and testing
 * Generates realistic gig worker transaction data
 */
export class MockPlaidService {
  static createLinkToken(borrowerId: string): { linkToken: string; expiration: string } {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 30);

    return {
      linkToken: `mock-link-token-${borrowerId}-${Date.now()}`,
      expiration: expiration.toISOString(),
    };
  }

  static exchangePublicToken(_publicToken: string, borrowerId: string): LinkedAccount {
    return {
      id: uuidv4(),
      borrowerId,
      itemId: `mock-item-${Date.now()}`,
      accessToken: `mock-access-token-${Date.now()}`, // Not encrypted in mock mode
      institutionId: 'ins_mock_001',
      institutionName: 'Mock Bank',
      accountIds: ['mock-checking-001', 'mock-savings-001'],
      consentExpiresAt: null,
      lastSyncedAt: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static fetchTransactions(startDate: string, endDate: string): PlaidTransaction[] {
    const transactions: PlaidTransaction[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate 24 months of realistic gig worker income data
    const incomeSources = [
      { name: 'Uber', platform: 'UBER', baseAmount: 180000, variance: 0.3 }, // $1800/mo avg
      { name: 'DoorDash', platform: 'DOORDASH', baseAmount: 120000, variance: 0.4 }, // $1200/mo avg
      { name: 'Upwork', platform: 'UPWORK', baseAmount: 250000, variance: 0.5 }, // $2500/mo avg
      { name: 'Consulting Client A', platform: null, baseAmount: 150000, variance: 0.2 }, // $1500/mo
    ];

    // Seasonal multipliers (higher in summer/holidays)
    const seasonalMultipliers: Record<number, number> = {
      0: 0.85, // January
      1: 0.9,  // February
      2: 0.95, // March
      3: 1.0,  // April
      4: 1.05, // May
      5: 1.15, // June
      6: 1.2,  // July
      7: 1.15, // August
      8: 1.0,  // September
      9: 1.0,  // October
      10: 1.1, // November
      11: 1.25, // December
    };

    // Growth trend: 8% year-over-year growth
    const monthsTotal = Math.ceil((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const growthPerMonth = Math.pow(1.08, 1 / 12);

    let currentDate = new Date(start);
    let monthIndex = 0;

    while (currentDate <= end) {
      const month = currentDate.getMonth();
      const seasonalMultiplier = seasonalMultipliers[month] ?? 1.0;
      const growthMultiplier = Math.pow(growthPerMonth, monthsTotal - monthIndex);

      for (const source of incomeSources) {
        // Random variance for this month
        const variance = 1 + (Math.random() - 0.5) * source.variance;
        const monthlyAmount = Math.round(
          source.baseAmount * seasonalMultiplier * growthMultiplier * variance
        );

        // Split into multiple deposits per month (realistic for gig work)
        const depositsPerMonth = source.platform ? Math.floor(Math.random() * 3) + 2 : 1;
        const depositAmount = Math.round(monthlyAmount / depositsPerMonth);

        for (let d = 0; d < depositsPerMonth; d++) {
          const depositDay = Math.floor(Math.random() * 28) + 1;
          const txDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), depositDay);

          if (txDate >= start && txDate <= end) {
            transactions.push({
              id: `mock-tx-${uuidv4()}`,
              accountId: 'mock-checking-001',
              amount: depositAmount,
              date: txDate.toISOString().split('T')[0]!,
              name: source.platform ? `${source.name} Direct Deposit` : source.name,
              merchantName: source.platform ? source.name : null,
              category: ['Transfer', 'Deposit'],
              pending: false,
              transactionType: 'income',
              incomeSourceType: source.platform ? 'GIG_PLATFORM' : 'CONTRACTOR_1099',
            });
          }
        }
      }

      // Add some random expenses for realism
      const expenseCount = Math.floor(Math.random() * 20) + 30;
      for (let e = 0; e < expenseCount; e++) {
        const expenseDay = Math.floor(Math.random() * 28) + 1;
        const txDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), expenseDay);

        if (txDate >= start && txDate <= end) {
          const expenseAmount = -Math.round((Math.random() * 15000 + 500)); // $5-$155

          transactions.push({
            id: `mock-tx-${uuidv4()}`,
            accountId: 'mock-checking-001',
            amount: expenseAmount,
            date: txDate.toISOString().split('T')[0]!,
            name: MockPlaidService.randomExpenseName(),
            merchantName: null,
            category: ['Shopping'],
            pending: false,
            transactionType: 'expense',
            incomeSourceType: null,
          });
        }
      }

      // Add recurring debt payments
      const debtPayments = [
        { name: 'Auto Loan Payment', amount: -45000 }, // $450
        { name: 'Student Loan Payment', amount: -25000 }, // $250
        { name: 'Credit Card Payment', amount: -30000 }, // $300
      ];

      for (const payment of debtPayments) {
        const txDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
        if (txDate >= start && txDate <= end) {
          transactions.push({
            id: `mock-tx-${uuidv4()}`,
            accountId: 'mock-checking-001',
            amount: payment.amount,
            date: txDate.toISOString().split('T')[0]!,
            name: payment.name,
            merchantName: null,
            category: ['Transfer', 'Debit'],
            pending: false,
            transactionType: 'expense',
            incomeSourceType: null,
          });
        }
      }

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      monthIndex++;
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return transactions;
  }

  static fetchIdentity(): PlaidIdentity {
    return {
      names: ['John Michael Doe'],
      emails: ['john.doe@email.com'],
      phoneNumbers: ['5551234567'],
      addresses: [
        {
          street: '123 Main Street',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          country: 'US',
        },
      ],
    };
  }

  private static randomExpenseName(): string {
    const expenses = [
      'AMAZON', 'WALMART', 'TARGET', 'COSTCO', 'GAS STATION',
      'GROCERY STORE', 'RESTAURANT', 'COFFEE SHOP', 'NETFLIX',
      'SPOTIFY', 'ATM WITHDRAWAL', 'UBER RIDE', 'LYFT RIDE',
      'PHONE BILL', 'INTERNET BILL', 'UTILITY PAYMENT',
    ];
    return expenses[Math.floor(Math.random() * expenses.length)]!;
  }
}

// Export singleton instance factory
export function createPlaidService(kmsKeyId: string, region?: string): PlaidService {
  return new PlaidService(kmsKeyId, region);
}
