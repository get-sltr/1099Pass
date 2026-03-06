/**
 * Services index - exports all service modules
 */

export { PlaidService, MockPlaidService, createPlaidService } from './plaid-service';
export type {
  PlaidCredentials,
  LinkedAccount,
  PlaidTransaction,
  IncomeSourceType,
  PlaidIdentity,
  SyncResult,
} from './plaid-service';

export { IncomeNormalizationService, incomeNormalizationService } from './income-normalization-service';
export type {
  IncomeTrajectory,
  RiskLevel,
  IncomeSource,
  MonthlyIncome,
  StabilityMetrics,
  AnnualizedProjection,
  DetectedObligation,
  DebtToIncomeAnalysis,
  NormalizedIncomeProfile,
} from './income-normalization-service';

export { LoanScoreService, loanScoreService } from './loan-score-service';
export type {
  LetterGrade,
  LoanType,
  ScoreComponent,
  ScoreBreakdown,
  Recommendation,
  LoanReadinessScore,
  ScoreHistory,
  DocumentationStatus,
} from './loan-score-service';

export { ReportGeneratorService, createReportGeneratorService } from './report-generator-service';
export type {
  ReportMetadata,
  BorrowerSummary,
  IncomeOverview,
  IncomeSourceSummary,
  MonthlyIncomeData,
  DocumentVerification,
  LenderReport,
  ShareToken,
  ShareAccess,
} from './report-generator-service';

export { askClaude } from './ai-service';
export type { ModelTier, AskClaudeOptions } from './ai-service';
export { generateIncomeNarrative } from './ai-report-narrator';
export {
  classifyAmbiguousTransactions,
  type TransactionInput,
  type ClassificationResult,
} from './ai-transaction-classifier';
export { chatWithCoach, type CoachContext } from './ai-borrower-coach';
export {
  analyzeUploadedDocument,
  analyzeDocumentImage,
  type DocumentType,
  type DocumentExtraction,
} from './ai-document-analyzer';
export {
  rankLenderMatches,
  type LenderMatchInput,
  type LenderRankResult,
} from './ai-matching-service';
