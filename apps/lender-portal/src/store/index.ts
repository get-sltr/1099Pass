// Export all stores
export { useAuthStore, hasPermission, type User, type UserRole } from './auth-store';
export { useReportsStore, type BorrowerReport, type ReportFilters } from './reports-store';
export {
  useCriteriaStore,
  INCOME_SOURCE_OPTIONS,
  US_STATES,
  incomeSourceOptions,
  usStates,
  type LendingCriteria
} from './criteria-store';
export { useUIStore } from './ui-store';
