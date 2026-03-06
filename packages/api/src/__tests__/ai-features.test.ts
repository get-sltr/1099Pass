/**
 * Tests for AI feature services (narrator, classifier, coach, document, matching)
 * Mocks askClaude so tests run without Bedrock
 */

import type { NormalizedIncomeProfile } from '../services/income-normalization-service';
import type {
  ScoreComponent,
  Recommendation,
  LoanReadinessScore,
  LoanType,
} from '../services/loan-score-service';

const mockAskClaude = jest.fn();
jest.mock('../services/ai-service', () => ({
  askClaude: (...args: unknown[]) => mockAskClaude(...args),
}));

describe('AI Report Narrator', () => {
  beforeEach(() => {
    mockAskClaude.mockReset();
    mockAskClaude.mockResolvedValue('This borrower shows stable gig income.');
  });

  it('should call askClaude with profile data in prompt', async () => {
    const { generateIncomeNarrative } = await import('../services/ai-report-narrator');
    const profile = createMockProfile();

    await generateIncomeNarrative(profile);

    expect(mockAskClaude).toHaveBeenCalledTimes(1);
    const prompt = mockAskClaude.mock.calls[0][0];
    expect(prompt).toContain('60000.00');
    expect(prompt).toContain('Uber');
    expect(prompt).toContain('STABLE');
    expect(prompt).toContain('12');
  });

  it('should return narrative text', async () => {
    const { generateIncomeNarrative } = await import('../services/ai-report-narrator');
    const out = await generateIncomeNarrative(createMockProfile());
    expect(out).toBe('This borrower shows stable gig income.');
  });
});

describe('AI Transaction Classifier', () => {
  beforeEach(() => {
    mockAskClaude.mockReset();
  });

  it('should return empty array for no transactions', async () => {
    const { classifyAmbiguousTransactions } = await import(
      '../services/ai-transaction-classifier'
    );
    const out = await classifyAmbiguousTransactions([]);
    expect(out).toEqual([]);
    expect(mockAskClaude).not.toHaveBeenCalled();
  });

  it('should parse JSON array from askClaude response', async () => {
    mockAskClaude.mockResolvedValue(
      '[{"index":0,"incomeSourceType":"GIG_PLATFORM","platformName":"Uber","confidence":0.95}]'
    );
    const { classifyAmbiguousTransactions } = await import(
      '../services/ai-transaction-classifier'
    );
    const out = await classifyAmbiguousTransactions([
      { name: 'UBER', merchantName: null, amount: 150000, category: ['Transfer'] },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      index: 0,
      incomeSourceType: 'GIG_PLATFORM',
      platformName: 'Uber',
      confidence: 0.95,
    });
  });
});

describe('AI Borrower Coach', () => {
  beforeEach(() => {
    mockAskClaude.mockResolvedValue('Focus on connecting more accounts to improve your score.');
  });

  it('should call askClaude with message and context', async () => {
    const { chatWithCoach } = await import('../services/ai-borrower-coach');
    const context: {
      score: number;
      grade: string;
      components: ScoreComponent[];
      recommendations: Recommendation[];
    } = {
      score: 65,
      grade: 'C',
      components: [
        {
          name: 'Stability',
          rawScore: 70,
          weight: 0.25,
          weightedScore: 17.5,
          factors: [],
          improvementTips: [],
        },
      ],
      recommendations: [
        {
          category: 'docs',
          action: 'Upload 1099',
          potentialScoreIncrease: 5,
          priority: 'HIGH',
          timeframe: '1 week',
        },
      ],
    };
    const beforeCalls = mockAskClaude.mock.calls.length;
    await chatWithCoach('How can I improve?', [], context);
    expect(mockAskClaude.mock.calls.length).toBeGreaterThan(beforeCalls);
    const lastCall = mockAskClaude.mock.calls[mockAskClaude.mock.calls.length - 1];
    const prompt = lastCall[0];
    expect(prompt).toContain('How can I improve?');
    expect(lastCall[1].systemPrompt).toContain('65');
    expect(lastCall[1].systemPrompt).toContain('C');
  });

  it('should return coach reply', async () => {
    const { chatWithCoach } = await import('../services/ai-borrower-coach');
    const reply = await chatWithCoach('Hi', [], {
      score: 0,
      grade: 'N/A',
      components: [],
      recommendations: [],
    });
    expect(reply).toBe('Focus on connecting more accounts to improve your score.');
  });
});

describe('AI Document Analyzer', () => {
  beforeEach(() => {
    mockAskClaude.mockResolvedValue(
      JSON.stringify({ payerName: 'Acme Inc', taxYear: 2023 })
    );
  });

  it('should return extraction object', async () => {
    const { analyzeUploadedDocument } = await import(
      '../services/ai-document-analyzer'
    );
    const out = await analyzeUploadedDocument('base64...', '1099_FORM');
    expect(out).toEqual({ payerName: 'Acme Inc', taxYear: 2023 });
  });

  it('should pass document type in prompt', async () => {
    const { analyzeUploadedDocument } = await import(
      '../services/ai-document-analyzer'
    );
    await analyzeUploadedDocument('base64...', 'BANK_STATEMENT');
    const lastCall = mockAskClaude.mock.calls[mockAskClaude.mock.calls.length - 1];
    const prompt = lastCall[0];
    expect(prompt).toContain('BANK STATEMENT');
  });
});

describe('AI Matching Service', () => {
  beforeEach(() => {
    mockAskClaude.mockResolvedValue(
      '[{"lenderId":"l-1","aiScore":85,"reasoning":"Good fit for gig income."}]'
    );
  });

  it('should return empty array for no lenders', async () => {
    const { rankLenderMatches } = await import('../services/ai-matching-service');
    const profile = createMockProfile();
    const score = createMockLoanScore();
    const callsBefore = mockAskClaude.mock.calls.length;
    const out = await rankLenderMatches(profile, score, []);
    expect(out).toEqual([]);
    expect(mockAskClaude.mock.calls.length).toBe(callsBefore);
  });

  it('should parse lender rank results', async () => {
    const { rankLenderMatches } = await import('../services/ai-matching-service');
    const profile = createMockProfile();
    const score = createMockLoanScore();
    const out = await rankLenderMatches(profile, score, [
      {
        lender: {
          id: 'l-1',
          institution_name: 'Test Bank',
          lender_type: 'BANK',
        },
        criteria: {
          loan_types: ['MORTGAGE'],
          min_annual_income: 50000,
          accepted_gig_platforms: [],
        },
        basicMatchScore: 70,
      },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      lenderId: 'l-1',
      aiScore: 85,
      reasoning: 'Good fit for gig income.',
    });
  });
});

// Helpers
function createMockProfile(): NormalizedIncomeProfile {
  return {
    borrowerId: 'b-1',
    generatedAt: new Date(),
    periodStart: '2024-01-01',
    periodEnd: '2024-12-31',
    monthsAnalyzed: 12,
    totalProjectedAnnualIncome: 6000000,
    averageMonthlyIncome: 500000,
    activeIncomeSourceCount: 1,
    trajectory: 'STABLE',
    incomeSources: [
      {
        id: 's1',
        name: 'Uber',
        platformType: 'GIG_PLATFORM',
        gigPlatform: 'Uber',
        totalIncomeCents: 6000000,
        monthlyAverageCents: 500000,
        monthsActive: 12,
        firstSeenDate: '2024-01-01',
        lastSeenDate: '2024-12-01',
        isRecurring: true,
        verificationStatus: 'VERIFIED',
        transactions: [],
      },
    ],
    monthlyHistory: [],
    stabilityMetrics: {
      coefficientOfVariation: 0.2,
      weightedAverageMonthly: 500000,
      yearOverYearGrowthRate: 5,
      incomeDiversityScore: 50,
      seasonalityIndex: 0.1,
      trajectory: 'STABLE',
      maintenanceProbability: 0.8,
    },
    annualizedProjection: {
      method1_trailingAverage: 6000000,
      method2_weightedMovingAverage: 6000000,
      method3_seasonalAdjusted: 6000000,
      method4_trendAdjusted: 6000000,
      finalProjection: 6000000,
      confidenceIntervalLow: 5000000,
      confidenceIntervalHigh: 7000000,
      confidenceLevel: 'MEDIUM',
      primaryMethod: 'trailing',
    },
    debtAnalysis: {
      totalMonthlyObligations: 200000,
      estimatedDTI: 40,
      obligations: [],
      caveat: 'Estimated',
    },
    riskLevel: 'LOW',
    riskFactors: [],
    positiveFactors: [],
  };
}

function createMockLoanScore() {
  return {
    overallScore: 72,
    letterGrade: 'C' as const,
    breakdown: {
      incomeStability: {
        name: 'Stability',
        rawScore: 75,
        weight: 0.25,
        weightedScore: 18.75,
        factors: [],
        improvementTips: [],
      },
      incomeTrend: {
        name: 'Trend',
        rawScore: 70,
        weight: 0.2,
        weightedScore: 14,
        factors: [],
        improvementTips: [],
      },
      incomeDiversity: {
        name: 'Diversity',
        rawScore: 65,
        weight: 0.15,
        weightedScore: 9.75,
        factors: [],
        improvementTips: [],
      },
      documentationCompleteness: {
        name: 'Docs',
        rawScore: 80,
        weight: 0.15,
        weightedScore: 12,
        factors: [],
        improvementTips: [],
      },
      incomeLevel: {
        name: 'Level',
        rawScore: 70,
        weight: 0.15,
        weightedScore: 10.5,
        factors: [],
        improvementTips: [],
      },
      accountAge: {
        name: 'Age',
        rawScore: 75,
        weight: 0.1,
        weightedScore: 7.5,
        factors: [],
        improvementTips: [],
      },
    },
    recommendations: [],
    loanTypeThresholds: {
      MORTGAGE: { recommended: 75, minimum: 60 },
      AUTO: { recommended: 55, minimum: 40 },
      PERSONAL: { recommended: 50, minimum: 35 },
      BUSINESS: { recommended: 65, minimum: 50 },
      HELOC: { recommended: 70, minimum: 55 },
    },
    qualifiedLoanTypes: ['PERSONAL', 'AUTO'] as LoanType[],
    potentialLoanTypes: ['MORTGAGE'] as LoanType[],
    calculatedAt: new Date(),
  } as LoanReadinessScore;
}
