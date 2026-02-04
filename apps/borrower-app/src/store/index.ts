/**
 * Store Index
 * Centralized export for all Zustand stores
 */

export { useAuthStore } from './auth-store';
export { useProfileStore } from './profile-store';
export type { IncomeSource, FinancialProfile, BorrowerProfile } from './profile-store';

export { useReportStore } from './report-store';
export type { Report, ReportStatus, ReportPeriod, ReportGenerationOptions } from './report-store';

export { useDocumentStore } from './document-store';
export type { Document, DocumentType, DocumentStatus, UploadProgress } from './document-store';

export { useLenderStore } from './lender-store';
export type { Lender, LoanType, LenderFilters } from './lender-store';

export { useMessagingStore } from './messaging-store';
export type { Message, Conversation } from './messaging-store';

export { useNotificationStore } from './notification-store';
export type { AppNotification, NotificationType, NotificationPreferences } from './notification-store';

export { useSubscriptionStore } from './subscription-store';
export type { Subscription, SubscriptionTier, SubscriptionPlan, UsageStats } from './subscription-store';
