"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportSchema = exports.ReportSchema = exports.ReportDataSnapshotSchema = exports.ReportStatus = exports.ReportType = void 0;
const zod_1 = require("zod");
/** Type of income report */
var ReportType;
(function (ReportType) {
    ReportType["MORTGAGE_READY"] = "MORTGAGE_READY";
    ReportType["AUTO_LOAN_READY"] = "AUTO_LOAN_READY";
    ReportType["GENERAL"] = "GENERAL";
})(ReportType || (exports.ReportType = ReportType = {}));
/** Report generation/lifecycle status */
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["GENERATING"] = "GENERATING";
    ReportStatus["READY"] = "READY";
    ReportStatus["EXPIRED"] = "EXPIRED";
    ReportStatus["REVOKED"] = "REVOKED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
/** Zod schema for ReportDataSnapshot */
exports.ReportDataSnapshotSchema = zod_1.z.object({
    total_annual_income: zod_1.z.number().min(0),
    monthly_average: zod_1.z.number().min(0),
    income_trend: zod_1.z.string(),
    loan_readiness_score: zod_1.z.number().int().min(0).max(100),
    source_count: zod_1.z.number().int().min(0),
    sources: zod_1.z.array(zod_1.z.object({
        platform_name: zod_1.z.string(),
        platform_type: zod_1.z.string(),
        annual_total: zod_1.z.number().min(0),
        verified: zod_1.z.boolean(),
    })),
    debt_to_income_ratio: zod_1.z.number().min(0).max(1).optional(),
    credit_score_range: zod_1.z.string().optional(),
    documents_verified: zod_1.z.number().int().min(0),
    documents_total: zod_1.z.number().int().min(0),
    generated_at: zod_1.z.string().datetime(),
});
/** Zod schema for Report */
exports.ReportSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    borrower_id: zod_1.z.string().uuid(),
    report_type: zod_1.z.nativeEnum(ReportType),
    status: zod_1.z.nativeEnum(ReportStatus),
    generated_at: zod_1.z.string().datetime(),
    expires_at: zod_1.z.string().datetime(),
    data_snapshot: exports.ReportDataSnapshotSchema,
    pdf_s3_key: zod_1.z.string().optional(),
    share_token: zod_1.z.string().optional(),
    share_expires_at: zod_1.z.string().datetime().optional(),
    view_count: zod_1.z.number().int().min(0),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
/** Zod schema for generate report request */
exports.GenerateReportSchema = zod_1.z.object({
    report_type: zod_1.z.nativeEnum(ReportType),
});
//# sourceMappingURL=report.js.map