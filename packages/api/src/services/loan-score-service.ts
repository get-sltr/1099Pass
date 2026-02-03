/**
 * Loan Readiness Score Engine
 * Calculates the proprietary 0-100 Loan Readiness Score
 * with actionable recommendations for improvement
 */

import type {
  NormalizedIncomeProfile,
  StabilityMetrics,
  IncomeSource,
} from './income-normalization-service';

// Types
export type LetterGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
export type LoanType = 'MORTGAGE' | 'AUTO' | 'PERSONAL' | 'BUSINESS' | 'HELOC';

export interface ScoreComponent {
  name: string;
  weight: number; // 0-1
  rawScore: number; // 0-100
  weightedScore: number; // 0-weight*100
  factors: string[];
  improvementTips: string[];
}

export interface ScoreBreakdown {
  incomeStability: ScoreComponent;
  incomeTrend: ScoreComponent;
  incomeDiversity: ScoreComponent;
  documentationCompleteness: ScoreComponent;
  incomeLevel: ScoreComponent;
  accountAge: ScoreComponent;
}

export interface Recommendation {
  category: string;
  action: string;
  potentialScoreIncrease: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timeframe: string;
}

export interface LoanReadinessScore {
  overallScore: number; // 0-100
  letterGrade: LetterGrade;
  breakdown: ScoreBreakdown;
  recommendations: Recommendation[];
  loanTypeThresholds: Record<LoanType, { recommended: number; minimum: number }>;
  qualifiedLoanTypes: LoanType[];
  potentialLoanTypes: LoanType[];
  calculatedAt: Date;
}

export interface ScoreHistory {
  borrowerId: string;
  scores: Array<{
    date: Date;
    score: number;
    letterGrade: LetterGrade;
    components: {
      stability: number;
      trend: number;
      diversity: number;
      documentation: number;
      incomeLevel: number;
      accountAge: number;
    };
  }>;
}

export interface DocumentationStatus {
  hasTaxReturns: boolean;
  has1099Forms: boolean;
  hasBankStatements: boolean;
  hasW2Forms: boolean;
  hasOtherIncomeDocs: boolean;
  linkedBankAccounts: number;
}

/**
 * Loan Readiness Score Service
 * Calculates and tracks loan readiness scores
 */
export class LoanScoreService {
  // Weight configuration for score components
  private static readonly WEIGHTS = {
    incomeStability: 0.25,
    incomeTrend: 0.20,
    incomeDiversity: 0.15,
    documentationCompleteness: 0.15,
    incomeLevel: 0.15,
    accountAge: 0.10,
  };

  // Loan type thresholds
  private static readonly LOAN_THRESHOLDS: Record<LoanType, { recommended: number; minimum: number }> = {
    MORTGAGE: { recommended: 75, minimum: 60 },
    AUTO: { recommended: 55, minimum: 40 },
    PERSONAL: { recommended: 50, minimum: 35 },
    BUSINESS: { recommended: 65, minimum: 50 },
    HELOC: { recommended: 70, minimum: 55 },
  };

  /**
   * Calculate the loan readiness score
   */
  calculateScore(
    profile: NormalizedIncomeProfile,
    documentationStatus: DocumentationStatus,
    targetLoanAmount?: number,
    targetLoanType?: LoanType
  ): LoanReadinessScore {
    // Calculate each component
    const incomeStability = this.calculateStabilityScore(profile.stabilityMetrics);
    const incomeTrend = this.calculateTrendScore(profile.stabilityMetrics);
    const incomeDiversity = this.calculateDiversityScore(profile.incomeSources);
    const documentationCompleteness = this.calculateDocumentationScore(documentationStatus);
    const incomeLevel = this.calculateIncomeLevelScore(
      profile.annualizedProjection.finalProjection,
      profile.debtAnalysis.estimatedDTI,
      targetLoanAmount,
      targetLoanType
    );
    const accountAge = this.calculateAccountAgeScore(profile.monthsAnalyzed);

    const breakdown: ScoreBreakdown = {
      incomeStability,
      incomeTrend,
      incomeDiversity,
      documentationCompleteness,
      incomeLevel,
      accountAge,
    };

    // Calculate overall score
    const overallScore = Math.round(
      incomeStability.weightedScore +
        incomeTrend.weightedScore +
        incomeDiversity.weightedScore +
        documentationCompleteness.weightedScore +
        incomeLevel.weightedScore +
        accountAge.weightedScore
    );

    const letterGrade = this.scoreToGrade(overallScore);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      breakdown,
      profile,
      documentationStatus
    );

    // Determine qualified loan types
    const { qualifiedLoanTypes, potentialLoanTypes } = this.determineLoanTypeQualification(
      overallScore
    );

    return {
      overallScore,
      letterGrade,
      breakdown,
      recommendations,
      loanTypeThresholds: LoanScoreService.LOAN_THRESHOLDS,
      qualifiedLoanTypes,
      potentialLoanTypes,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate income stability score (25% weight)
   * Based on Coefficient of Variation
   */
  private calculateStabilityScore(metrics: StabilityMetrics): ScoreComponent {
    const cv = metrics.coefficientOfVariation;
    let rawScore: number;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    // CV scoring: lower CV = more stable = higher score
    if (cv < 0.10) {
      rawScore = 100;
      factors.push('Exceptional income stability');
    } else if (cv < 0.15) {
      rawScore = 95;
      factors.push('Very stable income pattern');
    } else if (cv < 0.20) {
      rawScore = 85;
      factors.push('Stable income with minor variations');
    } else if (cv < 0.25) {
      rawScore = 75;
      factors.push('Moderately stable income');
    } else if (cv < 0.30) {
      rawScore = 65;
      factors.push('Some income variability');
      improvementTips.push('Consider adding more consistent income sources to reduce variability');
    } else if (cv < 0.40) {
      rawScore = 50;
      factors.push('Notable income fluctuations');
      improvementTips.push('Building a more consistent payment schedule with clients could improve stability');
    } else if (cv < 0.50) {
      rawScore = 35;
      factors.push('Significant income variability');
      improvementTips.push('Adding a stable part-time income source could significantly improve this score');
    } else {
      rawScore = 20;
      factors.push('High income variability');
      improvementTips.push('Focus on building recurring client relationships for more predictable income');
    }

    // Bonus for maintenance probability
    if (metrics.maintenanceProbability > 0.8) {
      rawScore = Math.min(100, rawScore + 5);
      factors.push('Strong likelihood of income continuation');
    }

    const weight = LoanScoreService.WEIGHTS.incomeStability;

    return {
      name: 'Income Stability',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Calculate income trend score (20% weight)
   * Based on year-over-year growth
   */
  private calculateTrendScore(metrics: StabilityMetrics): ScoreComponent {
    const yoyGrowth = metrics.yearOverYearGrowthRate;
    const trajectory = metrics.trajectory;
    let rawScore: number;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    // Growth rate scoring
    if (yoyGrowth >= 20) {
      rawScore = 100;
      factors.push(`Strong income growth: ${yoyGrowth.toFixed(1)}% year-over-year`);
    } else if (yoyGrowth >= 10) {
      rawScore = 90;
      factors.push(`Healthy income growth: ${yoyGrowth.toFixed(1)}% year-over-year`);
    } else if (yoyGrowth >= 5) {
      rawScore = 80;
      factors.push(`Modest income growth: ${yoyGrowth.toFixed(1)}% year-over-year`);
    } else if (yoyGrowth >= 0) {
      rawScore = 70;
      factors.push(`Stable income: ${yoyGrowth.toFixed(1)}% year-over-year`);
    } else if (yoyGrowth >= -5) {
      rawScore = 55;
      factors.push(`Slight income decline: ${yoyGrowth.toFixed(1)}% year-over-year`);
      improvementTips.push('Increasing work hours or adding clients could reverse this trend');
    } else if (yoyGrowth >= -15) {
      rawScore = 40;
      factors.push(`Income declining: ${yoyGrowth.toFixed(1)}% year-over-year`);
      improvementTips.push('Consider diversifying income sources to stabilize earnings');
    } else {
      rawScore = 25;
      factors.push(`Significant income decline: ${yoyGrowth.toFixed(1)}% year-over-year`);
      improvementTips.push('Addressing the income decline should be a priority before applying for loans');
    }

    // Trajectory bonus/penalty
    if (trajectory === 'GROWING') {
      rawScore = Math.min(100, rawScore + 5);
      factors.push('Positive trajectory confirmed');
    } else if (trajectory === 'VOLATILE') {
      rawScore = Math.max(0, rawScore - 10);
      factors.push('Volatile pattern detected');
    } else if (trajectory === 'SEASONAL') {
      factors.push('Seasonal income pattern detected');
      improvementTips.push('Lenders may require additional documentation for seasonal income');
    }

    const weight = LoanScoreService.WEIGHTS.incomeTrend;

    return {
      name: 'Income Trend',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Calculate income diversity score (15% weight)
   * Based on number of sources and concentration
   */
  private calculateDiversityScore(sources: IncomeSource[]): ScoreComponent {
    const activeSourceCount = sources.filter((s) => s.monthsActive >= 3).length;
    const totalIncome = sources.reduce((sum, s) => sum + s.totalIncomeCents, 0);
    let rawScore: number;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    // Base score on number of sources
    if (activeSourceCount >= 5) {
      rawScore = 95;
      factors.push(`Excellent diversification with ${activeSourceCount} active income sources`);
    } else if (activeSourceCount >= 4) {
      rawScore = 90;
      factors.push(`Well-diversified with ${activeSourceCount} active income sources`);
    } else if (activeSourceCount >= 3) {
      rawScore = 80;
      factors.push(`Good diversification with ${activeSourceCount} active income sources`);
    } else if (activeSourceCount >= 2) {
      rawScore = 65;
      factors.push(`${activeSourceCount} active income sources`);
      improvementTips.push('Adding another income source could improve your diversity score by ~15 points');
    } else {
      rawScore = 40;
      factors.push('Single income source detected');
      improvementTips.push('Multiple income sources significantly reduce lending risk — consider adding another gig platform');
    }

    // Check for concentration (no single source > 50% of total)
    if (totalIncome > 0) {
      const maxConcentration = Math.max(
        ...sources.map((s) => s.totalIncomeCents / totalIncome)
      );

      if (maxConcentration > 0.70) {
        rawScore = Math.max(0, rawScore - 20);
        const dominantSource = sources.find(
          (s) => s.totalIncomeCents / totalIncome > 0.70
        );
        factors.push(`High concentration: ${dominantSource?.name} represents ${(maxConcentration * 100).toFixed(0)}% of income`);
        improvementTips.push('Reducing reliance on a single income source would improve this score');
      } else if (maxConcentration > 0.50) {
        rawScore = Math.max(0, rawScore - 10);
        factors.push('Moderate concentration in primary income source');
      } else {
        rawScore = Math.min(100, rawScore + 5);
        factors.push('Well-balanced income distribution across sources');
      }
    }

    const weight = LoanScoreService.WEIGHTS.incomeDiversity;

    return {
      name: 'Income Diversity',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Calculate documentation completeness score (15% weight)
   */
  private calculateDocumentationScore(docs: DocumentationStatus): ScoreComponent {
    let rawScore = 0;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    // Tax returns (30 points)
    if (docs.hasTaxReturns) {
      rawScore += 30;
      factors.push('Tax returns on file');
    } else {
      improvementTips.push('Uploading your tax returns could improve your Documentation score by ~20 points');
    }

    // 1099 forms (25 points)
    if (docs.has1099Forms) {
      rawScore += 25;
      factors.push('1099 forms verified');
    } else {
      improvementTips.push('Adding your 1099 forms would strengthen income verification');
    }

    // Bank statements or linked accounts (25 points)
    if (docs.hasBankStatements || docs.linkedBankAccounts > 0) {
      rawScore += 25;
      if (docs.linkedBankAccounts > 0) {
        factors.push(`${docs.linkedBankAccounts} bank account(s) linked for live verification`);
      } else {
        factors.push('Bank statements uploaded');
      }
    } else {
      improvementTips.push('Linking your bank account provides real-time income verification');
    }

    // Additional documents (20 points)
    if (docs.hasW2Forms) {
      rawScore += 10;
      factors.push('W-2 forms on file');
    }
    if (docs.hasOtherIncomeDocs) {
      rawScore += 10;
      factors.push('Additional income documentation provided');
    }

    // Bonus for multiple linked accounts
    if (docs.linkedBankAccounts >= 2) {
      rawScore = Math.min(100, rawScore + 5);
      factors.push('Multiple accounts linked for comprehensive verification');
    }

    if (rawScore === 0) {
      factors.push('No documentation uploaded');
      improvementTips.push('Upload tax returns and 1099 forms to establish income documentation');
    }

    const weight = LoanScoreService.WEIGHTS.documentationCompleteness;

    return {
      name: 'Documentation Completeness',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Calculate income level score (15% weight)
   * Based on absolute income and DTI
   */
  private calculateIncomeLevelScore(
    annualIncomeCents: number,
    estimatedDTI: number,
    targetLoanAmount?: number,
    targetLoanType?: LoanType
  ): ScoreComponent {
    let rawScore: number;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    const annualIncomeUSD = annualIncomeCents / 100;
    const monthlyIncomeUSD = annualIncomeUSD / 12;

    // Base score on income level (for general assessment)
    if (annualIncomeUSD >= 150000) {
      rawScore = 95;
      factors.push(`Strong annual income: $${annualIncomeUSD.toLocaleString()}`);
    } else if (annualIncomeUSD >= 100000) {
      rawScore = 85;
      factors.push(`Healthy annual income: $${annualIncomeUSD.toLocaleString()}`);
    } else if (annualIncomeUSD >= 75000) {
      rawScore = 75;
      factors.push(`Solid annual income: $${annualIncomeUSD.toLocaleString()}`);
    } else if (annualIncomeUSD >= 50000) {
      rawScore = 65;
      factors.push(`Moderate annual income: $${annualIncomeUSD.toLocaleString()}`);
    } else if (annualIncomeUSD >= 35000) {
      rawScore = 50;
      factors.push(`Annual income: $${annualIncomeUSD.toLocaleString()}`);
    } else {
      rawScore = 35;
      factors.push(`Annual income: $${annualIncomeUSD.toLocaleString()}`);
      improvementTips.push('Increasing income would expand your loan options');
    }

    // DTI adjustment
    if (estimatedDTI < 30) {
      rawScore = Math.min(100, rawScore + 10);
      factors.push(`Excellent estimated DTI: ${estimatedDTI.toFixed(1)}%`);
    } else if (estimatedDTI < 40) {
      rawScore = Math.min(100, rawScore + 5);
      factors.push(`Good estimated DTI: ${estimatedDTI.toFixed(1)}%`);
    } else if (estimatedDTI < 50) {
      factors.push(`Moderate estimated DTI: ${estimatedDTI.toFixed(1)}%`);
    } else {
      rawScore = Math.max(0, rawScore - 15);
      factors.push(`High estimated DTI: ${estimatedDTI.toFixed(1)}%`);
      improvementTips.push('Paying down existing debt could significantly improve your loan eligibility');
    }

    // Target loan assessment (if provided)
    if (targetLoanAmount && monthlyIncomeUSD > 0) {
      // Estimate monthly payment (rough: assume 7% rate, 30-year for mortgage, 5-year for others)
      const isMortgage = targetLoanType === 'MORTGAGE' || targetLoanType === 'HELOC';
      const monthlyPaymentEstimate = this.estimateMonthlyPayment(
        targetLoanAmount,
        isMortgage ? 0.07 : 0.10,
        isMortgage ? 360 : 60
      );

      const loanDTI = (monthlyPaymentEstimate / monthlyIncomeUSD) * 100;

      if (loanDTI < 28) {
        factors.push(`Target loan appears affordable (${loanDTI.toFixed(1)}% of monthly income)`);
      } else if (loanDTI < 36) {
        factors.push(`Target loan may be attainable (${loanDTI.toFixed(1)}% of monthly income)`);
      } else {
        factors.push(`Target loan may be challenging (${loanDTI.toFixed(1)}% of monthly income)`);
        improvementTips.push('Consider a smaller loan amount or longer term to improve affordability');
      }
    }

    const weight = LoanScoreService.WEIGHTS.incomeLevel;

    return {
      name: 'Income Level',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Calculate account age score (10% weight)
   */
  private calculateAccountAgeScore(monthsAnalyzed: number): ScoreComponent {
    let rawScore: number;
    const factors: string[] = [];
    const improvementTips: string[] = [];

    if (monthsAnalyzed >= 24) {
      rawScore = 100;
      factors.push(`Excellent history: ${monthsAnalyzed} months of data`);
    } else if (monthsAnalyzed >= 18) {
      rawScore = 85;
      factors.push(`Strong history: ${monthsAnalyzed} months of data`);
    } else if (monthsAnalyzed >= 12) {
      rawScore = 70;
      factors.push(`Good history: ${monthsAnalyzed} months of data`);
    } else if (monthsAnalyzed >= 6) {
      rawScore = 50;
      factors.push(`${monthsAnalyzed} months of income history`);
      improvementTips.push(`${12 - monthsAnalyzed} more months of history would improve this score`);
    } else if (monthsAnalyzed >= 3) {
      rawScore = 30;
      factors.push(`Limited history: ${monthsAnalyzed} months`);
      improvementTips.push('Building more income history over time will naturally improve this score');
    } else {
      rawScore = 15;
      factors.push(`Very limited history: ${monthsAnalyzed} months`);
      improvementTips.push('Most lenders require at least 12 months of income history');
    }

    const weight = LoanScoreService.WEIGHTS.accountAge;

    return {
      name: 'Account Age',
      weight,
      rawScore,
      weightedScore: rawScore * weight,
      factors,
      improvementTips,
    };
  }

  /**
   * Convert numerical score to letter grade
   */
  private scoreToGrade(score: number): LetterGrade {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate prioritized recommendations
   */
  private generateRecommendations(
    breakdown: ScoreBreakdown,
    profile: NormalizedIncomeProfile,
    docs: DocumentationStatus
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Collect all improvement tips with estimated impact
    const components = [
      { component: breakdown.incomeStability, impact: 25 },
      { component: breakdown.incomeTrend, impact: 20 },
      { component: breakdown.incomeDiversity, impact: 15 },
      { component: breakdown.documentationCompleteness, impact: 15 },
      { component: breakdown.incomeLevel, impact: 15 },
      { component: breakdown.accountAge, impact: 10 },
    ];

    for (const { component } of components) {
      const potentialGain = (100 - component.rawScore) * component.weight;

      for (const tip of component.improvementTips) {
        // Estimate score increase based on improvement potential
        const potentialIncrease = Math.round(potentialGain * 0.5);

        recommendations.push({
          category: component.name,
          action: tip,
          potentialScoreIncrease: potentialIncrease,
          priority: potentialIncrease >= 10 ? 'HIGH' : potentialIncrease >= 5 ? 'MEDIUM' : 'LOW',
          timeframe: this.estimateTimeframe(component.name),
        });
      }
    }

    // Add specific actionable recommendations
    if (!docs.hasTaxReturns) {
      recommendations.push({
        category: 'Documentation',
        action: 'Upload your most recent tax return to verify annual income',
        potentialScoreIncrease: 5,
        priority: 'HIGH',
        timeframe: 'Immediate',
      });
    }

    if (docs.linkedBankAccounts === 0) {
      recommendations.push({
        category: 'Documentation',
        action: 'Link your primary bank account for real-time income verification',
        potentialScoreIncrease: 8,
        priority: 'HIGH',
        timeframe: 'Immediate',
      });
    }

    if (profile.incomeSources.length === 1) {
      recommendations.push({
        category: 'Income Diversity',
        action: 'Consider adding a secondary income source (even part-time) to demonstrate income resilience',
        potentialScoreIncrease: 10,
        priority: 'MEDIUM',
        timeframe: '1-3 months',
      });
    }

    // Sort by potential score increase
    recommendations.sort((a, b) => b.potentialScoreIncrease - a.potentialScoreIncrease);

    // Return top 5 recommendations
    return recommendations.slice(0, 5);
  }

  /**
   * Estimate timeframe for improvement
   */
  private estimateTimeframe(category: string): string {
    switch (category) {
      case 'Documentation Completeness':
        return 'Immediate';
      case 'Income Diversity':
        return '1-3 months';
      case 'Income Stability':
        return '3-6 months';
      case 'Income Trend':
        return '3-6 months';
      case 'Account Age':
        return '6-12 months';
      case 'Income Level':
        return 'Varies';
      default:
        return 'Varies';
    }
  }

  /**
   * Determine which loan types the borrower qualifies for
   */
  private determineLoanTypeQualification(score: number): {
    qualifiedLoanTypes: LoanType[];
    potentialLoanTypes: LoanType[];
  } {
    const qualifiedLoanTypes: LoanType[] = [];
    const potentialLoanTypes: LoanType[] = [];

    for (const [loanType, thresholds] of Object.entries(LoanScoreService.LOAN_THRESHOLDS)) {
      if (score >= thresholds.recommended) {
        qualifiedLoanTypes.push(loanType as LoanType);
      } else if (score >= thresholds.minimum) {
        potentialLoanTypes.push(loanType as LoanType);
      }
    }

    return { qualifiedLoanTypes, potentialLoanTypes };
  }

  /**
   * Estimate monthly payment for loan amount
   */
  private estimateMonthlyPayment(
    principal: number,
    annualRate: number,
    termMonths: number
  ): number {
    const monthlyRate = annualRate / 12;
    if (monthlyRate === 0) return principal / termMonths;

    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  }
}

// Export singleton instance
export const loanScoreService = new LoanScoreService();
