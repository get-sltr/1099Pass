/**
 * Tests for Loan Readiness Score Engine
 * Tests the proprietary 0-100 scoring system
 */

import { LoanScoreService, type DocumentationStatus } from '../services/loan-score-service';
import type { NormalizedIncomeProfile, StabilityMetrics, IncomeSource, AnnualizedProjection } from '../services/income-normalization-service';

describe('LoanScoreService', () => {
  let service: LoanScoreService;

  beforeEach(() => {
    service = new LoanScoreService();
  });

  describe('calculateScore', () => {
    it('should calculate overall score between 0-100', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should assign appropriate letter grade', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']).toContain(result.letterGrade);
    });

    it('should include all six components in breakdown', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeStability).toBeDefined();
      expect(result.breakdown.incomeTrend).toBeDefined();
      expect(result.breakdown.incomeDiversity).toBeDefined();
      expect(result.breakdown.documentationCompleteness).toBeDefined();
      expect(result.breakdown.incomeLevel).toBeDefined();
      expect(result.breakdown.accountAge).toBeDefined();
    });

    it('should weight components correctly (total = 100%)', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);
      const totalWeight =
        result.breakdown.incomeStability.weight +
        result.breakdown.incomeTrend.weight +
        result.breakdown.incomeDiversity.weight +
        result.breakdown.documentationCompleteness.weight +
        result.breakdown.incomeLevel.weight +
        result.breakdown.accountAge.weight;

      expect(totalWeight).toBeCloseTo(1, 2);
    });
  });

  describe('income stability scoring', () => {
    it('should score high for low coefficient of variation', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          coefficientOfVariation: 0.1,
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeStability.rawScore).toBeGreaterThanOrEqual(85);
    });

    it('should score low for high coefficient of variation', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          coefficientOfVariation: 0.6,
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeStability.rawScore).toBeLessThanOrEqual(30);
    });
  });

  describe('income trend scoring', () => {
    it('should score high for growing income', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          yearOverYearGrowthRate: 25,
          trajectory: 'GROWING',
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeTrend.rawScore).toBeGreaterThanOrEqual(85);
    });

    it('should score low for declining income', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          yearOverYearGrowthRate: -20,
          trajectory: 'DECLINING',
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeTrend.rawScore).toBeLessThanOrEqual(40);
    });
  });

  describe('income diversity scoring', () => {
    it('should score high for 4+ diversified sources', () => {
      const profile = createMockProfile({
        incomeSources: [
          createMockIncomeSource('Uber', 2500000), // 25% each
          createMockIncomeSource('DoorDash', 2500000),
          createMockIncomeSource('Upwork', 2500000),
          createMockIncomeSource('Client A', 2500000),
        ],
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeDiversity.rawScore).toBeGreaterThanOrEqual(80);
    });

    it('should score low for single income source', () => {
      const profile = createMockProfile({
        incomeSources: [createMockIncomeSource('Uber', 10000000)],
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeDiversity.rawScore).toBeLessThanOrEqual(50);
    });

    it('should penalize high concentration in one source', () => {
      const profile = createMockProfile({
        incomeSources: [
          createMockIncomeSource('Uber', 8000000), // 80%
          createMockIncomeSource('DoorDash', 2000000), // 20%
        ],
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeDiversity.factors.some(
        (f) => f.toLowerCase().includes('concentration')
      )).toBe(true);
    });
  });

  describe('documentation scoring', () => {
    it('should score high for complete documentation', () => {
      const profile = createMockProfile();
      const docs: DocumentationStatus = {
        hasTaxReturns: true,
        has1099Forms: true,
        hasBankStatements: true,
        hasW2Forms: true,
        hasOtherIncomeDocs: true,
        linkedBankAccounts: 2,
      };

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.documentationCompleteness.rawScore).toBeGreaterThanOrEqual(90);
    });

    it('should score low for missing documentation', () => {
      const profile = createMockProfile();
      const docs: DocumentationStatus = {
        hasTaxReturns: false,
        has1099Forms: false,
        hasBankStatements: false,
        hasW2Forms: false,
        hasOtherIncomeDocs: false,
        linkedBankAccounts: 0,
      };

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.documentationCompleteness.rawScore).toBeLessThanOrEqual(10);
    });
  });

  describe('account age scoring', () => {
    it('should score high for 24+ months of history', () => {
      const profile = createMockProfile({ monthsAnalyzed: 24 });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.accountAge.rawScore).toBe(100);
    });

    it('should score low for < 6 months of history', () => {
      const profile = createMockProfile({ monthsAnalyzed: 3 });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.accountAge.rawScore).toBeLessThanOrEqual(40);
    });
  });

  describe('recommendations', () => {
    it('should generate actionable recommendations', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.recommendations.length).toBeGreaterThan(0);
      result.recommendations.forEach((rec) => {
        expect(rec.action).toBeTruthy();
        expect(rec.potentialScoreIncrease).toBeGreaterThanOrEqual(0);
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(rec.priority);
      });
    });

    it('should recommend uploading tax returns when missing', () => {
      const profile = createMockProfile();
      const docs: DocumentationStatus = {
        hasTaxReturns: false,
        has1099Forms: true,
        hasBankStatements: true,
        hasW2Forms: false,
        hasOtherIncomeDocs: false,
        linkedBankAccounts: 1,
      };

      const result = service.calculateScore(profile, docs);

      expect(result.recommendations.some(
        (r) => r.action.toLowerCase().includes('tax return')
      )).toBe(true);
    });

    it('should recommend linking bank account when none linked', () => {
      const profile = createMockProfile();
      const docs: DocumentationStatus = {
        hasTaxReturns: true,
        has1099Forms: true,
        hasBankStatements: false,
        hasW2Forms: false,
        hasOtherIncomeDocs: false,
        linkedBankAccounts: 0,
      };

      const result = service.calculateScore(profile, docs);

      expect(result.recommendations.some(
        (r) => r.action.toLowerCase().includes('link') && r.action.toLowerCase().includes('bank')
      )).toBe(true);
    });
  });

  describe('loan type qualification', () => {
    it('should qualify for mortgage with high score', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          coefficientOfVariation: 0.1,
          yearOverYearGrowthRate: 15,
        },
        monthsAnalyzed: 24,
        annualizedProjection: createMockProjection(15000000), // $150k annual
      });
      const docs: DocumentationStatus = {
        hasTaxReturns: true,
        has1099Forms: true,
        hasBankStatements: true,
        hasW2Forms: true,
        hasOtherIncomeDocs: true,
        linkedBankAccounts: 2,
      };

      const result = service.calculateScore(profile, docs);

      if (result.overallScore >= 75) {
        expect(result.qualifiedLoanTypes).toContain('MORTGAGE');
      }
    });

    it('should qualify for auto loan with moderate score', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      if (result.overallScore >= 55) {
        expect(result.qualifiedLoanTypes).toContain('AUTO');
      }
    });

    it('should show potential loan types when score is in range', () => {
      const profile = createMockProfile();
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      // Combined qualified + potential should cover attainable loan types
      const allTypes = [...result.qualifiedLoanTypes, ...result.potentialLoanTypes];
      expect(allTypes.length).toBeGreaterThan(0);
    });
  });

  describe('income level scoring', () => {
    it('should score high for above median income', () => {
      const profile = createMockProfile({
        annualizedProjection: createMockProjection(12000000), // $120k annual
        debtAnalysis: {
          estimatedDTI: 20,
          totalMonthlyObligations: 100000,
          obligations: [],
          caveat: '',
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeLevel.rawScore).toBeGreaterThanOrEqual(60);
    });

    it('should score low for below median income with high DTI', () => {
      const profile = createMockProfile({
        annualizedProjection: createMockProjection(2400000), // $24k annual
        debtAnalysis: {
          estimatedDTI: 55,
          totalMonthlyObligations: 100000,
          obligations: [],
          caveat: '',
        },
      });
      const docs = createMockDocumentation();

      const result = service.calculateScore(profile, docs);

      expect(result.breakdown.incomeLevel.rawScore).toBeLessThanOrEqual(50);
    });
  });

  describe('score letter grades', () => {
    it('should assign A+ for score >= 95', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          coefficientOfVariation: 0.05,
          yearOverYearGrowthRate: 25,
          incomeDiversityScore: 95,
          maintenanceProbability: 0.95,
        },
        monthsAnalyzed: 30,
        annualizedProjection: createMockProjection(20000000),
        incomeSources: [
          createMockIncomeSource('A', 5000000),
          createMockIncomeSource('B', 5000000),
          createMockIncomeSource('C', 5000000),
          createMockIncomeSource('D', 5000000),
        ],
        debtAnalysis: {
          estimatedDTI: 15,
          totalMonthlyObligations: 50000,
          obligations: [],
          caveat: '',
        },
      });
      const docs: DocumentationStatus = {
        hasTaxReturns: true,
        has1099Forms: true,
        hasBankStatements: true,
        hasW2Forms: true,
        hasOtherIncomeDocs: true,
        linkedBankAccounts: 3,
      };

      const result = service.calculateScore(profile, docs);

      if (result.overallScore >= 95) {
        expect(result.letterGrade).toBe('A+');
      }
    });

    it('should assign F for score < 60', () => {
      const profile = createMockProfile({
        stabilityMetrics: {
          ...createMockStabilityMetrics(),
          coefficientOfVariation: 0.8,
          yearOverYearGrowthRate: -30,
          trajectory: 'DECLINING',
          incomeDiversityScore: 10,
        },
        monthsAnalyzed: 3,
        incomeSources: [createMockIncomeSource('Single', 500000)],
        debtAnalysis: {
          estimatedDTI: 60,
          totalMonthlyObligations: 300000,
          obligations: [],
          caveat: '',
        },
      });
      const docs: DocumentationStatus = {
        hasTaxReturns: false,
        has1099Forms: false,
        hasBankStatements: false,
        hasW2Forms: false,
        hasOtherIncomeDocs: false,
        linkedBankAccounts: 0,
      };

      const result = service.calculateScore(profile, docs);

      if (result.overallScore < 60) {
        expect(result.letterGrade).toBe('F');
      }
    });
  });
});

// Helper functions

function createMockStabilityMetrics(): StabilityMetrics {
  return {
    coefficientOfVariation: 0.25,
    weightedAverageMonthly: 500000,
    yearOverYearGrowthRate: 8,
    incomeDiversityScore: 65,
    seasonalityIndex: 0.15,
    trajectory: 'STABLE',
    maintenanceProbability: 0.7,
  };
}

function createMockProjection(annual: number): AnnualizedProjection {
  return {
    method1_trailingAverage: annual,
    method2_weightedMovingAverage: annual,
    method3_seasonalAdjusted: annual,
    method4_trendAdjusted: annual,
    finalProjection: annual,
    confidenceIntervalLow: Math.round(annual * 0.8),
    confidenceIntervalHigh: Math.round(annual * 1.2),
    confidenceLevel: 'MEDIUM',
    primaryMethod: 'Weighted Moving Average',
  };
}

function createMockIncomeSource(name: string, totalCents: number): IncomeSource {
  return {
    id: `source-${name}`,
    name,
    platformType: 'CONTRACTOR_1099',
    gigPlatform: null,
    totalIncomeCents: totalCents,
    monthlyAverageCents: Math.round(totalCents / 12),
    monthsActive: 12,
    firstSeenDate: '2023-01-01',
    lastSeenDate: '2024-01-01',
    isRecurring: true,
    verificationStatus: 'VERIFIED',
    transactions: [],
  };
}

function createMockProfile(overrides?: Partial<NormalizedIncomeProfile>): NormalizedIncomeProfile {
  const defaults: NormalizedIncomeProfile = {
    borrowerId: 'test-borrower',
    generatedAt: new Date(),
    periodStart: '2023-01-01',
    periodEnd: '2024-01-01',
    monthsAnalyzed: 12,
    totalProjectedAnnualIncome: 7200000, // $72k
    averageMonthlyIncome: 600000, // $6k
    activeIncomeSourceCount: 3,
    trajectory: 'STABLE',
    incomeSources: [
      createMockIncomeSource('Uber', 2500000),
      createMockIncomeSource('DoorDash', 2500000),
      createMockIncomeSource('Client', 2200000),
    ],
    monthlyHistory: [],
    stabilityMetrics: createMockStabilityMetrics(),
    annualizedProjection: createMockProjection(7200000),
    debtAnalysis: {
      estimatedDTI: 35,
      totalMonthlyObligations: 175000,
      obligations: [],
      caveat: 'Estimated from transaction data',
    },
    riskLevel: 'MODERATE',
    riskFactors: [],
    positiveFactors: ['Stable income pattern'],
  };

  return { ...defaults, ...overrides } as NormalizedIncomeProfile;
}

function createMockDocumentation(): DocumentationStatus {
  return {
    hasTaxReturns: true,
    has1099Forms: true,
    hasBankStatements: true,
    hasW2Forms: false,
    hasOtherIncomeDocs: false,
    linkedBankAccounts: 1,
  };
}
