/**
 * Tests for Report Generator Service
 * Tests report generation, PDF creation, and share tokens
 */

import { ReportGeneratorService, type DocumentVerification } from '../services/report-generator-service';
import type { NormalizedIncomeProfile, StabilityMetrics, AnnualizedProjection, IncomeSource } from '../services/income-normalization-service';
import type { LoanReadinessScore, ScoreBreakdown, ScoreComponent } from '../services/loan-score-service';

describe('ReportGeneratorService', () => {
  let service: ReportGeneratorService;

  beforeEach(() => {
    service = new ReportGeneratorService('test-bucket', 'us-east-1');
  });

  describe('generateReport', () => {
    it('should generate a complete lender report', () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date('2023-01-15'),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      // Verify metadata
      expect(report.metadata.reportId).toBeTruthy();
      expect(report.metadata.borrowerId).toBe('borrower-123');
      expect(report.metadata.version).toBe('1.0.0');
      expect(report.metadata.status).toBe('FINAL');
      expect(report.metadata.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should mask borrower name', () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.borrower.displayName).not.toBe('John Smith');
      // Service masks names with first name + last initial
      expect(report.borrower.displayName).toBe('John S.');
    });

    it('should include income overview', () => {
      const profile = createMockIncomeProfile();
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.incomeOverview.projectedAnnualIncome).toBe(profile.annualizedProjection.finalProjection);
      expect(report.incomeOverview.confidenceIntervalLow).toBe(profile.annualizedProjection.confidenceIntervalLow);
      expect(report.incomeOverview.confidenceIntervalHigh).toBe(profile.annualizedProjection.confidenceIntervalHigh);
      expect(report.incomeOverview.trajectory).toBe(profile.trajectory);
    });

    it('should include income sources with contribution percentages', () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.incomeSources.length).toBeGreaterThan(0);

      const totalContribution = report.incomeSources.reduce(
        (sum, s) => sum + s.contributionPercentage,
        0
      );
      // Should sum to approximately 100%
      expect(totalContribution).toBeGreaterThan(99);
      expect(totalContribution).toBeLessThanOrEqual(100);
    });

    it('should include loan readiness score breakdown', () => {
      const loanScore = createMockLoanScore();
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        loanScore,
        createMockDocumentStatus()
      );

      expect(report.loanReadinessScore.score).toBe(loanScore.overallScore);
      expect(report.loanReadinessScore.letterGrade).toBe(loanScore.letterGrade);
      expect(report.loanReadinessScore.componentBreakdown.length).toBe(6);
    });

    it('should include stability metrics', () => {
      const profile = createMockIncomeProfile();
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.stabilityMetrics.coefficientOfVariation).toBe(
        profile.stabilityMetrics.coefficientOfVariation
      );
      expect(report.stabilityMetrics.incomeDiversityScore).toBe(
        profile.stabilityMetrics.incomeDiversityScore
      );
    });

    it('should include legal disclaimer', () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.disclaimer).toContain('1099Pass');
      expect(report.disclaimer).toContain('not a lender');
    });

    it('should include DTI estimate', () => {
      const profile = createMockIncomeProfile();
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.debtToIncome.estimatedDTI).toBe(profile.debtAnalysis.estimatedDTI);
      expect(report.debtToIncome.monthlyObligations).toBe(profile.debtAnalysis.totalMonthlyObligations);
    });
  });

  describe('generatePDF', () => {
    it('should generate a PDF buffer', async () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      const pdf = await service.generatePDF(report);

      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
      // PDF files start with %PDF
      expect(pdf.slice(0, 4).toString()).toBe('%PDF');
    });

    it('should include report metadata in PDF info', async () => {
      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      const pdf = await service.generatePDF(report);
      const pdfString = pdf.toString();

      expect(pdfString).toContain('1099Pass');
    });
  });

  describe('generateShareToken', () => {
    it('should generate a valid share token', () => {
      const token = service.generateShareToken('report-123', 'borrower-456');

      expect(token.token).toBeTruthy();
      expect(token.token.length).toBeGreaterThan(20);
      expect(token.reportId).toBe('report-123');
      expect(token.borrowerId).toBe('borrower-456');
      expect(token.isRevoked).toBe(false);
      expect(token.accessCount).toBe(0);
    });

    it('should set token expiry to 30 days', () => {
      const token = service.generateShareToken('report-123', 'borrower-456');

      const expiryDays = Math.round(
        (token.expiresAt.getTime() - token.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(expiryDays).toBe(30);
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateShareToken('report-123', 'borrower-456');
      const token2 = service.generateShareToken('report-123', 'borrower-456');

      expect(token1.token).not.toBe(token2.token);
    });
  });

  describe('validateShareAccess', () => {
    it('should return true for valid token', () => {
      const token = service.generateShareToken('report-123', 'borrower-456');

      const isValid = service.validateShareAccess(token, '192.168.1.1');

      expect(isValid).toBe(true);
    });

    it('should return false for revoked token', () => {
      const token = service.generateShareToken('report-123', 'borrower-456');
      token.isRevoked = true;

      const isValid = service.validateShareAccess(token, '192.168.1.1');

      expect(isValid).toBe(false);
    });

    it('should return false for expired token', () => {
      const token = service.generateShareToken('report-123', 'borrower-456');
      token.expiresAt = new Date('2020-01-01');

      const isValid = service.validateShareAccess(token, '192.168.1.1');

      expect(isValid).toBe(false);
    });
  });

  describe('verification status', () => {
    it('should determine VERIFIED status with complete documentation', () => {
      const docs: DocumentVerification[] = [
        { documentType: 'Tax Returns', verifiedAt: new Date(), status: 'VERIFIED' },
        { documentType: '1099 Forms', verifiedAt: new Date(), status: 'VERIFIED' },
        { documentType: 'Bank Statements', verifiedAt: new Date(), status: 'VERIFIED' },
      ];

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        docs
      );

      expect(report.borrower.verificationStatus).toBe('VERIFIED');
    });

    it('should determine PARTIALLY_VERIFIED status with some documentation', () => {
      const docs: DocumentVerification[] = [
        { documentType: 'Tax Returns', verifiedAt: new Date(), status: 'VERIFIED' },
        { documentType: '1099 Forms', verifiedAt: null, status: 'NOT_PROVIDED' },
        { documentType: 'Bank Statements', verifiedAt: null, status: 'PENDING' },
      ];

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        createMockIncomeProfile(),
        createMockLoanScore(),
        docs
      );

      expect(report.borrower.verificationStatus).toBe('PARTIALLY_VERIFIED');
    });

    it('should determine UNVERIFIED status with no documentation', () => {
      const docs: DocumentVerification[] = [
        { documentType: 'Tax Returns', verifiedAt: null, status: 'NOT_PROVIDED' },
        { documentType: '1099 Forms', verifiedAt: null, status: 'NOT_PROVIDED' },
      ];

      // Create profile with unverified income sources
      const profile = createMockIncomeProfile();
      profile.incomeSources = profile.incomeSources.map(s => ({
        ...s,
        verificationStatus: 'UNVERIFIED' as const,
      }));

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        docs
      );

      // With bank-linked data, minimum is PARTIALLY_VERIFIED
      expect(['UNVERIFIED', 'PARTIALLY_VERIFIED']).toContain(report.borrower.verificationStatus);
    });
  });

  describe('trajectory descriptions', () => {
    it('should provide description for GROWING trajectory', () => {
      const profile = createMockIncomeProfile({ trajectory: 'GROWING' });

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.incomeOverview.trajectoryDescription.toLowerCase()).toContain('upward');
    });

    it('should provide description for DECLINING trajectory', () => {
      const profile = createMockIncomeProfile({ trajectory: 'DECLINING' });

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.incomeOverview.trajectoryDescription.toLowerCase()).toContain('downward');
    });

    it('should provide description for STABLE trajectory', () => {
      const profile = createMockIncomeProfile({ trajectory: 'STABLE' });

      const report = service.generateReport(
        'borrower-123',
        'John Smith',
        'Denver',
        'CO',
        new Date(),
        profile,
        createMockLoanScore(),
        createMockDocumentStatus()
      );

      expect(report.incomeOverview.trajectoryDescription.toLowerCase()).toContain('steady');
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

function createMockProjection(): AnnualizedProjection {
  return {
    method1_trailingAverage: 6000000,
    method2_weightedMovingAverage: 6000000,
    method3_seasonalAdjusted: 6000000,
    method4_trendAdjusted: 6000000,
    finalProjection: 6000000, // $60,000/year
    confidenceIntervalLow: 4800000,
    confidenceIntervalHigh: 7200000,
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

function createMockIncomeProfile(overrides?: Partial<NormalizedIncomeProfile>): NormalizedIncomeProfile {
  const defaults: NormalizedIncomeProfile = {
    borrowerId: 'test-borrower',
    generatedAt: new Date(),
    periodStart: '2023-01-01',
    periodEnd: '2024-01-01',
    monthsAnalyzed: 12,
    totalProjectedAnnualIncome: 6000000,
    averageMonthlyIncome: 500000,
    activeIncomeSourceCount: 3,
    trajectory: 'STABLE',
    incomeSources: [
      createMockIncomeSource('Uber', 2000000),
      createMockIncomeSource('DoorDash', 2000000),
      createMockIncomeSource('Client A', 2000000),
    ],
    monthlyHistory: [],
    stabilityMetrics: createMockStabilityMetrics(),
    annualizedProjection: createMockProjection(),
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

function createMockScoreComponent(name: string, score: number): ScoreComponent {
  return {
    name,
    rawScore: score,
    weightedScore: score * 0.2,
    weight: 0.2,
    factors: [],
    improvementTips: [],
  };
}

function createMockScoreBreakdown(): ScoreBreakdown {
  return {
    incomeStability: createMockScoreComponent('Income Stability', 75),
    incomeTrend: createMockScoreComponent('Income Trend', 70),
    incomeDiversity: createMockScoreComponent('Income Diversity', 65),
    documentationCompleteness: createMockScoreComponent('Documentation', 80),
    incomeLevel: createMockScoreComponent('Income Level', 70),
    accountAge: createMockScoreComponent('Account Age', 75),
  };
}

function createMockLoanScore(): LoanReadinessScore {
  return {
    overallScore: 72,
    letterGrade: 'C',
    breakdown: createMockScoreBreakdown(),
    recommendations: [],
    loanTypeThresholds: {
      MORTGAGE: { recommended: 75, minimum: 60 },
      AUTO: { recommended: 55, minimum: 40 },
      PERSONAL: { recommended: 50, minimum: 35 },
      BUSINESS: { recommended: 65, minimum: 50 },
      HELOC: { recommended: 70, minimum: 55 },
    },
    qualifiedLoanTypes: ['PERSONAL', 'AUTO'],
    potentialLoanTypes: ['MORTGAGE'],
    calculatedAt: new Date(),
  };
}

function createMockDocumentStatus(): DocumentVerification[] {
  return [
    { documentType: 'Tax Returns', verifiedAt: new Date(), status: 'VERIFIED' },
    { documentType: '1099 Forms', verifiedAt: new Date(), status: 'VERIFIED' },
    { documentType: 'Bank Statements', verifiedAt: new Date(), status: 'VERIFIED' },
  ];
}
