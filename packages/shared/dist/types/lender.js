"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLenderSchema = exports.CreateLenderSchema = exports.LenderSchema = exports.LenderStatus = exports.LenderPlanTier = exports.LenderType = void 0;
const zod_1 = require("zod");
/** Type of lending institution */
var LenderType;
(function (LenderType) {
    LenderType["BANK"] = "BANK";
    LenderType["CREDIT_UNION"] = "CREDIT_UNION";
    LenderType["MORTGAGE_COMPANY"] = "MORTGAGE_COMPANY";
    LenderType["FINTECH"] = "FINTECH";
    LenderType["OTHER"] = "OTHER";
})(LenderType || (exports.LenderType = LenderType = {}));
/** Lender subscription plan tier */
var LenderPlanTier;
(function (LenderPlanTier) {
    LenderPlanTier["STARTER"] = "STARTER";
    LenderPlanTier["PROFESSIONAL"] = "PROFESSIONAL";
    LenderPlanTier["ENTERPRISE"] = "ENTERPRISE";
})(LenderPlanTier || (exports.LenderPlanTier = LenderPlanTier = {}));
/** Lender account status */
var LenderStatus;
(function (LenderStatus) {
    LenderStatus["PENDING"] = "PENDING";
    LenderStatus["ACTIVE"] = "ACTIVE";
    LenderStatus["SUSPENDED"] = "SUSPENDED";
})(LenderStatus || (exports.LenderStatus = LenderStatus = {}));
/** Zod schema for Lender */
exports.LenderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    institution_name: zod_1.z.string().min(1).max(255),
    license_number: zod_1.z.string().min(1).max(100),
    lender_type: zod_1.z.nativeEnum(LenderType),
    status: zod_1.z.nativeEnum(LenderStatus),
    plan_tier: zod_1.z.nativeEnum(LenderPlanTier),
    verified: zod_1.z.boolean(),
    primary_contact_name: zod_1.z.string().min(1).max(200),
    primary_contact_email: zod_1.z.string().email(),
    primary_contact_phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
    website_url: zod_1.z.string().url().optional(),
    logo_url: zod_1.z.string().url().optional(),
    description: zod_1.z.string().max(2000).optional(),
    cognito_sub: zod_1.z.string().min(1),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
/** Zod schema for CreateLenderInput */
exports.CreateLenderSchema = exports.LenderSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    status: zod_1.z.nativeEnum(LenderStatus).default(LenderStatus.PENDING),
    verified: zod_1.z.boolean().default(false),
});
/** Zod schema for UpdateLenderInput */
exports.UpdateLenderSchema = exports.LenderSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    cognito_sub: true,
}).partial();
//# sourceMappingURL=lender.js.map