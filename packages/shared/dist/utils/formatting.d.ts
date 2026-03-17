/** Format a number as currency */
export declare function formatCurrency(amount: number, currency?: string, locale?: string): string;
/** Format a date to localized string */
export declare function formatDate(date: Date | string, locale?: string): string;
/** Format a date to short string */
export declare function formatDateShort(date: Date | string, locale?: string): string;
/** Format a date with time */
export declare function formatDateTime(date: Date | string, locale?: string): string;
/** Format a number as percentage */
export declare function formatPercentage(value: number, decimals?: number): string;
/** Format a US phone number */
export declare function formatPhoneNumber(phone: string): string;
/** Format file size in human-readable form */
export declare function formatFileSize(bytes: number): string;
/** Truncate text with ellipsis */
export declare function truncateText(text: string, maxLength: number): string;
/** Format number with thousand separators */
export declare function formatNumber(value: number, locale?: string): string;
/** Format relative time (e.g., "2 hours ago") */
export declare function formatTimeAgo(date: Date | string): string;
//# sourceMappingURL=formatting.d.ts.map