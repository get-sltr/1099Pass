"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBorrowerSchema = exports.CreateBorrowerSchema = exports.BorrowerSchema = exports.SubscriptionTier = exports.KYCStatus = void 0;
const zod_1 = require("zod");
/** KYC verification status */
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["IN_PROGRESS"] = "IN_PROGRESS";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["FAILED"] = "FAILED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
/** Borrower subscription tier */
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "FREE";
    SubscriptionTier["PLUS"] = "PLUS";
    SubscriptionTier["PRO"] = "PRO";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
/** Zod schema for Borrower */
exports.BorrowerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
    first_name: zod_1.z.string().min(1).max(100),
    last_name: zod_1.z.string().min(1).max(100),
    date_of_birth: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    street_address: zod_1.z.string().min(1).max(255),
    city: zod_1.z.string().min(1).max(100),
    state: zod_1.z.string().length(2),
    zip_code: zod_1.z.string().regex(/^\d{5}(-\d{4})?$/),
    kyc_status: zod_1.z.nativeEnum(KYCStatus),
    subscription_tier: zod_1.z.nativeEnum(SubscriptionTier),
    cognito_sub: zod_1.z.string().min(1),
    profile_image_url: zod_1.z.string().url().optional(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
/** Zod schema for CreateBorrowerInput */
exports.CreateBorrowerSchema = exports.BorrowerSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}).extend({
    kyc_status: zod_1.z.nativeEnum(KYCStatus).default(KYCStatus.PENDING),
    subscription_tier: zod_1.z.nativeEnum(SubscriptionTier).default(SubscriptionTier.FREE),
});
/** Zod schema for UpdateBorrowerInput */
exports.UpdateBorrowerSchema = exports.BorrowerSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    cognito_sub: true,
}).partial();
//# sourceMappingURL=borrower.js.map