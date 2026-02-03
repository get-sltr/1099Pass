/**
 * Income Normalization Engine
 * Core IP: Transforms raw transaction data into lender-ready income analysis
 * All monetary values in cents (integer arithmetic) to avoid floating point errors
 */

import { PlaidService, type PlaidTransaction, type IncomeSourceType } from './plaid-service';

// Types
export type IncomeTrajectory = 'GROWING' | 'STABLE' | 'DECLINING' | 'VOLATILE' | 'SEASONAL';
export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED';

export interface IncomeSource {
  id: string;
  name: string;
  platformType: IncomeSourceType;
  gigPlatform: string | null; // Specific platform like UBER, DOORDASH
  totalIncomeCents: number;
  monthlyAverageCents: number;
  monthsActive: number;
  firstSeenDate: string;
  lastSeenDate: string;
  isRecurring: boolean;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  transactions: PlaidTransaction[];
}

export interface MonthlyIncome {
  month: string; // YYYY-MM
  totalCents: number;
  bySource: Record<string, number>; // sourceId -> cents
  isAnomaly: boolean;
  anomalyReason: string | null;
}

export interface StabilityMetrics {
  coefficientOfVariation: number; // Lower = more stable (0-1+)
  weightedAverageMonthly: number; // Cents, recent months weighted higher
  yearOverYearGrowthRate: number; // Percentage (-100 to 100+)
  incomeDiversityScore: number; // 0-100
  seasonalityIndex: number; // 0-1, higher = more seasonal
  trajectory: IncomeTrajectory;
  maintenanceProbability: number; // 0-1, probability of maintaining income
}

export interface AnnualizedProjection {
  method1_trailingAverage: number; // Cents
  method2_weightedMovingAverage: number;
  method3_seasonalAdjusted: number;
  method4_trendAdjusted: number;
  finalProjection: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  primaryMethod: string; // Which method contributed most
}

export interface DetectedObligation {
  name: string;
  monthlyCents: number;
  frequency: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';
  category: 'LOAN' | 'CREDIT_CARD' | 'RENT' | 'UTILITY' | 'OTHER';
  isEstimate: boolean;
}

export interface DebtToIncomeAnalysis {
  totalMonthlyObligations: number; // Cents
  estimatedDTI: number; // Percentage (0-100)
  obligations: DetectedObligation[];
  caveat: string;
}

export interface NormalizedIncomeProfile {
  borrowerId: string;
  generatedAt: Date;
  periodStart: string;
  periodEnd: string;
  monthsAnalyzed: number;

  // Summary
  totalProjectedAnnualIncome: number; // Cents
  averageMonthlyIncome: number; // Cents
  activeIncomeSourceCount: number;
  trajectory: IncomeTrajectory;

  // Detailed breakdown
  incomeSources: IncomeSource[];
  monthlyHistory: MonthlyIncome[];
  stabilityMetrics: StabilityMetrics;
  annualizedProjection: AnnualizedProjection;
  debtAnalysis: DebtToIncomeAnalysis;

  // Risk assessment
  riskLevel: RiskLevel;
  riskFactors: string[];
  positiveFactors: string[];
}

/**
 * Income Normalization Service
 * Transforms raw transaction data into comprehensive income analysis
 */
export class IncomeNormalizationService {
  /**
   * Main entry point: normalize income from transactions
   */
  normalizeIncome(
    borrowerId: string,
    transactions: PlaidTransaction[],
    periodMonths: number = 24
  ): NormalizedIncomeProfile {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - periodMonths);

    // Filter to income transactions only
    const incomeTransactions = transactions.filter(
      (tx) => tx.transactionType === 'income' && !tx.pending
    );

    // Filter to expense transactions for obligation detection
    const expenseTransactions = transactions.filter(
      (tx) => tx.transactionType === 'expense' && !tx.pending
    );

    // Step 1: Identify and group income sources
    const incomeSources = this.identifyIncomeSources(incomeTransactions);

    // Step 2: Build monthly income history
    const monthlyHistory = this.buildMonthlyHistory(
      incomeTransactions,
      incomeSources,
      startDate,
      endDate
    );

    // Step 3: Calculate stability metrics
    const stabilityMetrics = this.calculateStabilityMetrics(monthlyHistory, incomeSources);

    // Step 4: Calculate annualized projection
    const annualizedProjection = this.calculateAnnualizedProjection(
      monthlyHistory,
      stabilityMetrics
    );

    // Step 5: Detect obligations and calculate DTI
    const debtAnalysis = this.analyzeDebtAndObligations(
      expenseTransactions,
      annualizedProjection.finalProjection
    );

    // Step 6: Assess overall risk
    const { riskLevel, riskFactors, positiveFactors } = this.assessRisk(
      stabilityMetrics,
      incomeSources,
      debtAnalysis
    );

    return {
      borrowerId,
      generatedAt: new Date(),
      periodStart: startDate.toISOString().split('T')[0]!,
      periodEnd: endDate.toISOString().split('T')[0]!,
      monthsAnalyzed: monthlyHistory.length,

      totalProjectedAnnualIncome: annualizedProjection.finalProjection,
      averageMonthlyIncome: Math.round(annualizedProjection.finalProjection / 12),
      activeIncomeSourceCount: incomeSources.filter((s) => s.monthsActive >= 3).length,
      trajectory: stabilityMetrics.trajectory,

      incomeSources,
      monthlyHistory,
      stabilityMetrics,
      annualizedProjection,
      debtAnalysis,

      riskLevel,
      riskFactors,
      positiveFactors,
    };
  }

  /**
   * Step 1: Identify and group income sources from transactions
   */
  private identifyIncomeSources(transactions: PlaidTransaction[]): IncomeSource[] {
    const sourceMap = new Map<string, {
      transactions: PlaidTransaction[];
      gigPlatform: string | null;
      platformType: IncomeSourceType;
    }>();

    for (const tx of transactions) {
      // Identify specific gig platform
      const gigPlatform = PlaidService.identifyGigPlatform(tx.name, tx.merchantName);
      const platformType = tx.incomeSourceType || 'OTHER';

      // Create a source key based on platform or merchant name pattern
      let sourceKey: string;
      if (gigPlatform) {
        sourceKey = gigPlatform;
      } else if (tx.merchantName) {
        sourceKey = tx.merchantName.toLowerCase().trim();
      } else {
        // Group by normalized name (first 20 chars, lowercase)
        sourceKey = tx.name.toLowerCase().substring(0, 20).trim();
      }

      if (!sourceMap.has(sourceKey)) {
        sourceMap.set(sourceKey, {
          transactions: [],
          gigPlatform,
          platformType,
        });
      }

      sourceMap.get(sourceKey)!.transactions.push(tx);
    }

    // Convert to IncomeSource array
    const sources: IncomeSource[] = [];
    let sourceIndex = 0;

    for (const [key, data] of sourceMap.entries()) {
      const txs = data.transactions;
      if (txs.length === 0) continue;

      const totalCents = txs.reduce((sum, tx) => sum + tx.amount, 0);
      const dates = txs.map((tx) => new Date(tx.date));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      // Calculate months active
      const monthsActive = this.calculateMonthsActive(txs);

      // Determine if recurring (at least once per month on average over active period)
      const isRecurring = txs.length >= monthsActive;

      // Create readable name
      let name = key;
      if (data.gigPlatform) {
        name = this.formatGigPlatformName(data.gigPlatform);
      } else {
        name = this.titleCase(key);
      }

      sources.push({
        id: `source-${sourceIndex++}`,
        name,
        platformType: data.platformType,
        gigPlatform: data.gigPlatform,
        totalIncomeCents: totalCents,
        monthlyAverageCents: Math.round(totalCents / Math.max(monthsActive, 1)),
        monthsActive,
        firstSeenDate: minDate.toISOString().split('T')[0]!,
        lastSeenDate: maxDate.toISOString().split('T')[0]!,
        isRecurring,
        verificationStatus: 'VERIFIED', // Bank-linked = verified
        transactions: txs,
      });
    }

    // Sort by total income descending
    sources.sort((a, b) => b.totalIncomeCents - a.totalIncomeCents);

    return sources;
  }

  /**
   * Step 2: Build month-by-month income history
   */
  private buildMonthlyHistory(
    transactions: PlaidTransaction[],
    sources: IncomeSource[],
    startDate: Date,
    endDate: Date
  ): MonthlyIncome[] {
    const monthlyData = new Map<string, MonthlyIncome>();

    // Initialize all months in range
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, {
        month: monthKey,
        totalCents: 0,
        bySource: {},
        isAnomaly: false,
        anomalyReason: null,
      });
      current.setMonth(current.getMonth() + 1);
    }

    // Aggregate transactions by month
    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;

      const monthData = monthlyData.get(monthKey);
      if (monthData) {
        monthData.totalCents += tx.amount;

        // Find the source for this transaction
        const source = sources.find((s) => s.transactions.includes(tx));
        if (source) {
          monthData.bySource[source.id] = (monthData.bySource[source.id] || 0) + tx.amount;
        }
      }
    }

    // Convert to array, sort by month descending (most recent first), and flag anomalies
    const monthlyHistory = Array.from(monthlyData.values()).sort((a, b) =>
      b.month.localeCompare(a.month)
    );
    this.flagAnomalies(monthlyHistory);

    return monthlyHistory;
  }

  /**
   * Flag anomalous months (unusually high or low)
   */
  private flagAnomalies(monthlyHistory: MonthlyIncome[]): void {
    if (monthlyHistory.length < 3) return;

    const amounts = monthlyHistory.map((m) => m.totalCents);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
    );

    // Flag months > 2 standard deviations from mean
    for (const month of monthlyHistory) {
      const zScore = stdDev > 0 ? (month.totalCents - mean) / stdDev : 0;

      if (zScore > 2) {
        month.isAnomaly = true;
        month.anomalyReason = 'Unusually high income - possible one-time payment';
      } else if (zScore < -2 && month.totalCents > 0) {
        month.isAnomaly = true;
        month.anomalyReason = 'Unusually low income - possible seasonal dip';
      } else if (month.totalCents === 0) {
        month.isAnomaly = true;
        month.anomalyReason = 'Zero income month';
      }
    }
  }

  /**
   * Step 3: Calculate stability metrics
   */
  private calculateStabilityMetrics(
    monthlyHistory: MonthlyIncome[],
    sources: IncomeSource[]
  ): StabilityMetrics {
    const amounts = monthlyHistory.map((m) => m.totalCents);
    const nonZeroAmounts = amounts.filter((a) => a > 0);

    // Coefficient of Variation (CV = stdDev / mean)
    const mean = nonZeroAmounts.length > 0
      ? nonZeroAmounts.reduce((a, b) => a + b, 0) / nonZeroAmounts.length
      : 0;
    const stdDev = nonZeroAmounts.length > 0
      ? Math.sqrt(
          nonZeroAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            nonZeroAmounts.length
        )
      : 0;
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;

    // Weighted Moving Average (recent 6 months weighted 2x)
    const weightedAverageMonthly = this.calculateWeightedAverage(amounts);

    // Year-over-Year Growth Rate
    const yearOverYearGrowthRate = this.calculateYoYGrowth(monthlyHistory);

    // Income Diversity Score (0-100)
    const incomeDiversityScore = this.calculateDiversityScore(sources);

    // Seasonality Index (0-1)
    const seasonalityIndex = this.calculateSeasonalityIndex(monthlyHistory);

    // Determine trajectory
    const trajectory = this.determineTrajectory(
      coefficientOfVariation,
      yearOverYearGrowthRate,
      seasonalityIndex
    );

    // Maintenance probability
    const maintenanceProbability = this.calculateMaintenanceProbability(
      coefficientOfVariation,
      trajectory,
      sources.length
    );

    return {
      coefficientOfVariation: Math.round(coefficientOfVariation * 1000) / 1000,
      weightedAverageMonthly: Math.round(weightedAverageMonthly),
      yearOverYearGrowthRate: Math.round(yearOverYearGrowthRate * 10) / 10,
      incomeDiversityScore: Math.round(incomeDiversityScore),
      seasonalityIndex: Math.round(seasonalityIndex * 100) / 100,
      trajectory,
      maintenanceProbability: Math.round(maintenanceProbability * 100) / 100,
    };
  }

  /**
   * Calculate weighted average (recent months weighted higher)
   */
  private calculateWeightedAverage(amounts: number[]): number {
    if (amounts.length === 0) return 0;

    // Most recent 6 months get 2x weight
    const weights: number[] = [];
    for (let i = 0; i < amounts.length; i++) {
      weights.push(i < 6 ? 2 : 1);
    }

    // Reverse so recent months are at the end of the array
    const reversedAmounts = [...amounts].reverse();
    const reversedWeights = [...weights].reverse();

    const weightedSum = reversedAmounts.reduce((sum, amt, i) => sum + amt * reversedWeights[i]!, 0);
    const totalWeight = reversedWeights.reduce((a, b) => a + b, 0);

    return weightedSum / totalWeight;
  }

  /**
   * Calculate year-over-year growth rate
   */
  private calculateYoYGrowth(monthlyHistory: MonthlyIncome[]): number {
    if (monthlyHistory.length < 12) return 0;

    // Compare last 12 months to previous 12 months
    const recent12 = monthlyHistory.slice(0, 12);
    const previous12 = monthlyHistory.slice(12, 24);

    if (previous12.length < 6) return 0;

    const recentTotal = recent12.reduce((sum, m) => sum + m.totalCents, 0);
    const previousTotal = previous12.reduce((sum, m) => sum + m.totalCents, 0);

    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;

    return ((recentTotal - previousTotal) / previousTotal) * 100;
  }

  /**
   * Calculate income diversity score (0-100)
   */
  private calculateDiversityScore(sources: IncomeSource[]): number {
    if (sources.length === 0) return 0;
    if (sources.length === 1) return 20;

    const totalIncome = sources.reduce((sum, s) => sum + s.totalIncomeCents, 0);
    if (totalIncome === 0) return 0;

    // Calculate concentration using Herfindahl-Hirschman Index (HHI)
    // HHI = sum of squared market shares
    let hhi = 0;
    for (const source of sources) {
      const share = source.totalIncomeCents / totalIncome;
      hhi += share * share;
    }

    // HHI ranges from 1/n (perfectly diverse) to 1 (perfectly concentrated)
    // Convert to 0-100 score where higher = more diverse
    const diversityScore = (1 - hhi) * 100;

    // Bonus for having 4+ sources
    const sourceBonus = Math.min(sources.length - 1, 3) * 5;

    return Math.min(100, diversityScore + sourceBonus);
  }

  /**
   * Calculate seasonality index (0-1)
   */
  private calculateSeasonalityIndex(monthlyHistory: MonthlyIncome[]): number {
    if (monthlyHistory.length < 12) return 0;

    // Group by calendar month
    const monthTotals: Record<number, number[]> = {};
    for (const record of monthlyHistory) {
      const month = parseInt(record.month.split('-')[1]!, 10);
      if (!monthTotals[month]) monthTotals[month] = [];
      monthTotals[month]!.push(record.totalCents);
    }

    // Calculate average for each calendar month
    const monthAverages: number[] = [];
    for (let m = 1; m <= 12; m++) {
      const values = monthTotals[m] || [];
      monthAverages.push(
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
      );
    }

    // Calculate coefficient of variation across calendar months
    const overallMean = monthAverages.reduce((a, b) => a + b, 0) / 12;
    if (overallMean === 0) return 0;

    const monthStdDev = Math.sqrt(
      monthAverages.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / 12
    );

    return Math.min(1, monthStdDev / overallMean);
  }

  /**
   * Determine income trajectory
   */
  private determineTrajectory(
    cv: number,
    yoyGrowth: number,
    seasonality: number
  ): IncomeTrajectory {
    if (cv > 0.5) return 'VOLATILE';
    if (seasonality > 0.3) return 'SEASONAL';
    if (yoyGrowth > 10) return 'GROWING';
    if (yoyGrowth < -10) return 'DECLINING';
    return 'STABLE';
  }

  /**
   * Calculate probability of maintaining current income
   */
  private calculateMaintenanceProbability(
    cv: number,
    trajectory: IncomeTrajectory,
    sourceCount: number
  ): number {
    let probability = 0.5; // Base probability

    // Stability adjustment
    if (cv < 0.15) probability += 0.2;
    else if (cv < 0.3) probability += 0.1;
    else if (cv > 0.5) probability -= 0.15;

    // Trajectory adjustment
    if (trajectory === 'GROWING') probability += 0.1;
    else if (trajectory === 'STABLE') probability += 0.05;
    else if (trajectory === 'DECLINING') probability -= 0.15;
    else if (trajectory === 'VOLATILE') probability -= 0.1;

    // Diversity adjustment
    if (sourceCount >= 4) probability += 0.1;
    else if (sourceCount >= 2) probability += 0.05;
    else probability -= 0.05;

    return Math.max(0.1, Math.min(0.95, probability));
  }

  /**
   * Step 4: Calculate annualized income projection
   */
  private calculateAnnualizedProjection(
    monthlyHistory: MonthlyIncome[],
    metrics: StabilityMetrics
  ): AnnualizedProjection {
    const amounts = monthlyHistory.map((m) => m.totalCents);
    const recent12 = amounts.slice(0, Math.min(12, amounts.length));

    // Method 1: Simple 12-month trailing average × 12
    const method1 =
      recent12.length > 0
        ? Math.round((recent12.reduce((a, b) => a + b, 0) / recent12.length) * 12)
        : 0;

    // Method 2: Weighted moving average (recent 6 months weighted 2x) × 12
    const method2 = Math.round(metrics.weightedAverageMonthly * 12);

    // Method 3: Seasonal adjustment
    const method3 = this.calculateSeasonalProjection(monthlyHistory);

    // Method 4: Trend-adjusted projection
    const method4 = this.calculateTrendAdjustedProjection(recent12, metrics.yearOverYearGrowthRate);

    // Final projection: weighted blend
    const { finalProjection, primaryMethod } = this.blendProjections(
      method1,
      method2,
      method3,
      method4,
      metrics
    );

    // Confidence interval (based on CV)
    const marginOfError = finalProjection * metrics.coefficientOfVariation * 0.5;
    const confidenceIntervalLow = Math.round(finalProjection - marginOfError);
    const confidenceIntervalHigh = Math.round(finalProjection + marginOfError);

    // Confidence level
    let confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (metrics.coefficientOfVariation < 0.2 && monthlyHistory.length >= 18) {
      confidenceLevel = 'HIGH';
    } else if (metrics.coefficientOfVariation > 0.4 || monthlyHistory.length < 6) {
      confidenceLevel = 'LOW';
    }

    return {
      method1_trailingAverage: method1,
      method2_weightedMovingAverage: method2,
      method3_seasonalAdjusted: method3,
      method4_trendAdjusted: method4,
      finalProjection,
      confidenceIntervalLow,
      confidenceIntervalHigh,
      confidenceLevel,
      primaryMethod,
    };
  }

  /**
   * Calculate seasonal-adjusted projection
   */
  private calculateSeasonalProjection(monthlyHistory: MonthlyIncome[]): number {
    if (monthlyHistory.length < 12) {
      // Not enough data for seasonal analysis
      const avg = monthlyHistory.reduce((sum, m) => sum + m.totalCents, 0) / monthlyHistory.length;
      return Math.round(avg * 12);
    }

    // Calculate seasonal factors for each month
    const monthTotals: Record<number, number[]> = {};
    for (const record of monthlyHistory) {
      const month = parseInt(record.month.split('-')[1]!, 10);
      if (!monthTotals[month]) monthTotals[month] = [];
      monthTotals[month]!.push(record.totalCents);
    }

    // Project next 12 months using seasonal factors
    let projection = 0;
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const targetMonth = ((now.getMonth() + i) % 12) + 1;
      const monthData = monthTotals[targetMonth] || [];
      const monthAvg =
        monthData.length > 0 ? monthData.reduce((a, b) => a + b, 0) / monthData.length : 0;
      projection += monthAvg;
    }

    return Math.round(projection);
  }

  /**
   * Calculate trend-adjusted projection
   */
  private calculateTrendAdjustedProjection(recent12: number[], yoyGrowth: number): number {
    if (recent12.length === 0) return 0;

    const currentAnnual = recent12.reduce((a, b) => a + b, 0);

    // Apply half of the YoY growth rate as forward projection
    // (conservative: don't assume full growth continues)
    const growthFactor = 1 + (yoyGrowth / 100) * 0.5;

    return Math.round(currentAnnual * growthFactor);
  }

  /**
   * Blend multiple projection methods
   */
  private blendProjections(
    method1: number,
    method2: number,
    method3: number,
    method4: number,
    metrics: StabilityMetrics
  ): { finalProjection: number; primaryMethod: string } {
    // Weight allocation based on data characteristics
    let w1 = 0.25; // Trailing average
    let w2 = 0.35; // Weighted moving average (default primary)
    let w3 = 0.2; // Seasonal
    let w4 = 0.2; // Trend-adjusted

    let primaryMethod = 'Weighted Moving Average';

    // Adjust weights based on characteristics
    if (metrics.seasonalityIndex > 0.25) {
      w3 = 0.4;
      w2 = 0.25;
      w4 = 0.2;
      w1 = 0.15;
      primaryMethod = 'Seasonal Adjusted';
    } else if (Math.abs(metrics.yearOverYearGrowthRate) > 15) {
      w4 = 0.4;
      w2 = 0.3;
      w1 = 0.2;
      w3 = 0.1;
      primaryMethod = 'Trend Adjusted';
    } else if (metrics.coefficientOfVariation < 0.15) {
      w1 = 0.4;
      w2 = 0.3;
      w3 = 0.15;
      w4 = 0.15;
      primaryMethod = 'Trailing Average';
    }

    const finalProjection = Math.round(w1 * method1 + w2 * method2 + w3 * method3 + w4 * method4);

    return { finalProjection, primaryMethod };
  }

  /**
   * Step 5: Analyze debt and obligations
   */
  private analyzeDebtAndObligations(
    expenseTransactions: PlaidTransaction[],
    annualIncome: number
  ): DebtToIncomeAnalysis {
    const obligations: DetectedObligation[] = [];

    // Group expenses by name pattern to find recurring payments
    const expensePatterns = new Map<string, PlaidTransaction[]>();

    for (const tx of expenseTransactions) {
      // Normalize the name
      const key = tx.name.toLowerCase().substring(0, 25).trim();
      if (!expensePatterns.has(key)) {
        expensePatterns.set(key, []);
      }
      expensePatterns.get(key)!.push(tx);
    }

    // Identify recurring payments (appear 3+ times with similar amounts)
    for (const [name, txs] of expensePatterns.entries()) {
      if (txs.length < 3) continue;

      // Calculate average amount (in cents, negative for expenses)
      const amounts = txs.map((t) => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      // Check if amounts are consistent (within 10% of average)
      const isConsistent = amounts.every(
        (a) => Math.abs(a - avgAmount) / avgAmount < 0.1
      );

      if (!isConsistent) continue;

      // Determine category and frequency
      const category = this.categorizeObligation(name);
      const frequency = this.detectPaymentFrequency(txs);

      // Only include likely debt obligations
      if (category === 'OTHER' && avgAmount < 5000) continue; // Skip small misc payments

      obligations.push({
        name: this.titleCase(name),
        monthlyCents: Math.round(this.normalizeToMonthly(avgAmount, frequency)),
        frequency,
        category,
        isEstimate: true,
      });
    }

    // Calculate total monthly obligations
    const totalMonthlyObligations = obligations.reduce((sum, o) => sum + o.monthlyCents, 0);

    // Calculate DTI
    const monthlyIncome = annualIncome / 12;
    const estimatedDTI = monthlyIncome > 0 ? (totalMonthlyObligations / monthlyIncome) * 100 : 0;

    return {
      totalMonthlyObligations,
      estimatedDTI: Math.round(estimatedDTI * 10) / 10,
      obligations,
      caveat:
        'DTI is estimated based on detected recurring payments. Actual DTI may vary based on obligations not visible in transaction history.',
    };
  }

  /**
   * Categorize an expense as a type of obligation
   */
  private categorizeObligation(
    name: string
  ): 'LOAN' | 'CREDIT_CARD' | 'RENT' | 'UTILITY' | 'OTHER' {
    const lower = name.toLowerCase();

    if (
      lower.includes('loan') ||
      lower.includes('auto pay') ||
      lower.includes('mortgage') ||
      lower.includes('student')
    ) {
      return 'LOAN';
    }

    if (
      lower.includes('credit card') ||
      lower.includes('chase') ||
      lower.includes('amex') ||
      lower.includes('capital one') ||
      lower.includes('discover') ||
      lower.includes('citi')
    ) {
      return 'CREDIT_CARD';
    }

    if (lower.includes('rent') || lower.includes('property mgmt') || lower.includes('landlord')) {
      return 'RENT';
    }

    if (
      lower.includes('electric') ||
      lower.includes('gas') ||
      lower.includes('water') ||
      lower.includes('utility') ||
      lower.includes('internet') ||
      lower.includes('phone')
    ) {
      return 'UTILITY';
    }

    return 'OTHER';
  }

  /**
   * Detect payment frequency from transaction dates
   */
  private detectPaymentFrequency(
    transactions: PlaidTransaction[]
  ): 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' {
    if (transactions.length < 2) return 'MONTHLY';

    const dates = transactions.map((t) => new Date(t.date).getTime()).sort((a, b) => a - b);
    const gaps: number[] = [];

    for (let i = 1; i < dates.length; i++) {
      const gapDays = (dates[i]! - dates[i - 1]!) / (1000 * 60 * 60 * 24);
      gaps.push(gapDays);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

    if (avgGap < 10) return 'WEEKLY';
    if (avgGap < 20) return 'BIWEEKLY';
    return 'MONTHLY';
  }

  /**
   * Normalize payment amount to monthly
   */
  private normalizeToMonthly(
    amount: number,
    frequency: 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY'
  ): number {
    switch (frequency) {
      case 'WEEKLY':
        return amount * 4.33;
      case 'BIWEEKLY':
        return amount * 2.17;
      default:
        return amount;
    }
  }

  /**
   * Step 6: Assess overall risk level
   */
  private assessRisk(
    metrics: StabilityMetrics,
    sources: IncomeSource[],
    debtAnalysis: DebtToIncomeAnalysis
  ): { riskLevel: RiskLevel; riskFactors: string[]; positiveFactors: string[] } {
    const riskFactors: string[] = [];
    const positiveFactors: string[] = [];
    let riskScore = 50; // Start at neutral

    // Evaluate stability
    if (metrics.coefficientOfVariation < 0.2) {
      riskScore -= 10;
      positiveFactors.push('Highly stable income pattern');
    } else if (metrics.coefficientOfVariation > 0.4) {
      riskScore += 15;
      riskFactors.push('Income shows significant variability');
    }

    // Evaluate trend
    if (metrics.trajectory === 'GROWING') {
      riskScore -= 10;
      positiveFactors.push('Income trending upward');
    } else if (metrics.trajectory === 'DECLINING') {
      riskScore += 20;
      riskFactors.push('Income showing declining trend');
    } else if (metrics.trajectory === 'VOLATILE') {
      riskScore += 10;
      riskFactors.push('Income pattern is volatile');
    }

    // Evaluate diversity
    if (sources.length >= 4) {
      riskScore -= 10;
      positiveFactors.push('Well-diversified income sources');
    } else if (sources.length === 1) {
      riskScore += 15;
      riskFactors.push('Single income source');
    }

    // Check for dominant source
    const totalIncome = sources.reduce((sum, s) => sum + s.totalIncomeCents, 0);
    const dominantSource = sources.find(
      (s) => s.totalIncomeCents > totalIncome * 0.7
    );
    if (dominantSource) {
      riskScore += 10;
      riskFactors.push(`Over 70% of income from ${dominantSource.name}`);
    }

    // Evaluate DTI
    if (debtAnalysis.estimatedDTI < 35) {
      riskScore -= 5;
      positiveFactors.push('Low debt-to-income ratio');
    } else if (debtAnalysis.estimatedDTI > 50) {
      riskScore += 15;
      riskFactors.push('High estimated debt-to-income ratio');
    }

    // Evaluate maintenance probability
    if (metrics.maintenanceProbability > 0.75) {
      positiveFactors.push('High likelihood of income maintenance');
    } else if (metrics.maintenanceProbability < 0.5) {
      riskFactors.push('Moderate uncertainty in income continuation');
    }

    // Determine risk level
    let riskLevel: RiskLevel;
    if (riskScore < 40) {
      riskLevel = 'LOW';
    } else if (riskScore < 65) {
      riskLevel = 'MODERATE';
    } else {
      riskLevel = 'ELEVATED';
    }

    return { riskLevel, riskFactors, positiveFactors };
  }

  // Helper methods
  private calculateMonthsActive(transactions: PlaidTransaction[]): number {
    if (transactions.length === 0) return 0;

    const months = new Set<string>();
    for (const tx of transactions) {
      const date = new Date(tx.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    }

    return months.size;
  }

  private formatGigPlatformName(platform: string): string {
    const names: Record<string, string> = {
      UBER: 'Uber',
      LYFT: 'Lyft',
      DOORDASH: 'DoorDash',
      GRUBHUB: 'Grubhub',
      INSTACART: 'Instacart',
      AMAZON_FLEX: 'Amazon Flex',
      TASKRABBIT: 'TaskRabbit',
      FIVERR: 'Fiverr',
      UPWORK: 'Upwork',
      ETSY: 'Etsy',
      SHOPIFY: 'Shopify',
      ROVER: 'Rover',
      TURO: 'Turo',
      AIRBNB: 'Airbnb',
      POSTMATES: 'Postmates',
      SHIPT: 'Shipt',
    };
    return names[platform] || platform;
  }

  private titleCase(str: string): string {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Export singleton instance
export const incomeNormalizationService = new IncomeNormalizationService();
