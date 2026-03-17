"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLendingCriteriaSchema = exports.LendingCriteriaSchema = exports.MatchSchema = exports.MatchStatus = void 0;
const zod_1 = require("zod");
const financial_profile_1 = require("./financial-profile");
/** Status of a borrower-lender match */
var MatchStatus;
(function (MatchStatus) {
    MatchStatus["PENDING"] = "PENDING";
    MatchStatus["VIEWED"] = "VIEWED";
    MatchStatus["INTERESTED"] = "INTERESTED";
    MatchStatus["CONTACTED"] = "CONTACTED";
    MatchStatus["DECLINED"] = "DECLINED";
})(MatchStatus || (exports.MatchStatus = MatchStatus = {}));
/** Zod schema for Match */
exports.MatchSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    borrower_id: zod_1.z.string().uuid(),
    lender_id: zod_1.z.string().uuid(),
    report_id: zod_1.z.string().uuid(),
    match_score: zod_1.z.number().int().min(0).max(100),
    status: zod_1.z.nativeEnum(MatchStatus),
    lender_notes: zod_1.z.string().max(2000).optional(),
    created_at: zod_1.z.string().datetime(),
    responded_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime(),
});
/** Zod schema for LendingCriteria */
exports.LendingCriteriaSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    lender_id: zod_1.z.string().uuid(),
    loan_types: zod_1.z.array(zod_1.z.string()),
    min_annual_income: zod_1.z.number().min(0),
    max_annual_income: zod_1.z.number().min(0).optional(),
    accepted_gig_platforms: zod_1.z.array(zod_1.z.nativeEnum(financial_profile_1.PlatformType)),
    geographic_coverage: zod_1.z.array(zod_1.z.string().length(2)),
    max_dti_ratio: zod_1.z.number().min(0).max(1).optional(),
    min_credit_score: zod_1.z.number().int().min(300).max(850).optional(),
    min_months_active: zod_1.z.number().int().min(0),
    active: zod_1.z.boolean(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
/** Zod schema for updating lending criteria */
exports.UpdateLendingCriteriaSchema = exports.LendingCriteriaSchema.omit({
    id: true,
    lender_id: true,
    created_at: true,
    updated_at: true,
}).partial();
//# sourceMappingURL=match.js.map