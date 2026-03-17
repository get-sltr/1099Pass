"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialProfileSchema = exports.IncomeSourceSchema = exports.MonthlyAmountSchema = exports.IncomeTrend = exports.PlatformType = void 0;
const zod_1 = require("zod");
/** Gig platform / income source type */
var PlatformType;
(function (PlatformType) {
    PlatformType["GIG_DELIVERY"] = "GIG_DELIVERY";
    PlatformType["GIG_RIDESHARE"] = "GIG_RIDESHARE";
    PlatformType["GIG_FREELANCE"] = "GIG_FREELANCE";
    PlatformType["GIG_MARKETPLACE"] = "GIG_MARKETPLACE";
    PlatformType["CONTRACTOR_1099"] = "CONTRACTOR_1099";
    PlatformType["SELF_EMPLOYED"] = "SELF_EMPLOYED";
    PlatformType["OTHER"] = "OTHER";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
/** Income trend direction */
var IncomeTrend;
(function (IncomeTrend) {
    IncomeTrend["INCREASING"] = "INCREASING";
    IncomeTrend["STABLE"] = "STABLE";
    IncomeTrend["DECREASING"] = "DECREASING";
    IncomeTrend["VOLATILE"] = "VOLATILE";
    IncomeTrend["INSUFFICIENT_DATA"] = "INSUFFICIENT_DATA";
})(IncomeTrend || (exports.IncomeTrend = IncomeTrend = {}));
/** Zod schema for MonthlyAmount */
exports.MonthlyAmountSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    amount: zod_1.z.number().min(0),
});
/** Zod schema for IncomeSource */
exports.IncomeSourceSchema = zod_1.z.object({
    platform_name: zod_1.z.string().min(1).max(100),
    platform_type: zod_1.z.nativeEnum(PlatformType),
    monthly_amounts: zod_1.z.array(exports.MonthlyAmountSchema),
    annual_total: zod_1.z.number().min(0),
    active_since: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    verified: zod_1.z.boolean(),
    plaid_account_id: zod_1.z.string().optional(),
});
/** Zod schema for FinancialProfile */
exports.FinancialProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    borrower_id: zod_1.z.string().uuid(),
    total_annual_income: zod_1.z.number().min(0),
    income_sources: zod_1.z.array(exports.IncomeSourceSchema),
    monthly_average: zod_1.z.number().min(0),
    income_trend: zod_1.z.nativeEnum(IncomeTrend),
    debt_to_income_ratio: zod_1.z.number().min(0).max(1).optional(),
    loan_readiness_score: zod_1.z.number().int().min(0).max(100),
    credit_score_range: zod_1.z.string().optional(),
    last_synced: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
//# sourceMappingURL=financial-profile.js.map