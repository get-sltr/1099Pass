"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatDate = formatDate;
exports.formatDateShort = formatDateShort;
exports.formatDateTime = formatDateTime;
exports.formatPercentage = formatPercentage;
exports.formatPhoneNumber = formatPhoneNumber;
exports.formatFileSize = formatFileSize;
exports.truncateText = truncateText;
exports.formatNumber = formatNumber;
exports.formatTimeAgo = formatTimeAgo;
/** Format a number as currency */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
/** Format a date to localized string */
function formatDate(date, locale = 'en-US') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}
/** Format a date to short string */
function formatDateShort(date, locale = 'en-US') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
}
/** Format a date with time */
function formatDateTime(date, locale = 'en-US') {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric',
    }).format(d);
}
/** Format a number as percentage */
function formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
}
/** Format a US phone number */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
}
/** Format file size in human-readable form */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
/** Truncate text with ellipsis */
function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.slice(0, maxLength - 3)}...`;
}
/** Format number with thousand separators */
function formatNumber(value, locale = 'en-US') {
    return new Intl.NumberFormat(locale).format(value);
}
/** Format relative time (e.g., "2 hours ago") */
function formatTimeAgo(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    const intervals = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60],
    ];
    for (const [unit, secs] of intervals) {
        const interval = Math.floor(seconds / secs);
        if (interval >= 1)
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
    return 'just now';
}
//# sourceMappingURL=formatting.js.map