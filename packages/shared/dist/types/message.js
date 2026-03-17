"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSchema = exports.SendMessageSchema = exports.MessageSchema = exports.UserType = exports.AllSubscriptionTier = exports.SubscriptionStatus = exports.MessageStatus = exports.SenderType = void 0;
const zod_1 = require("zod");
/** Type of message sender */
var SenderType;
(function (SenderType) {
    SenderType["BORROWER"] = "BORROWER";
    SenderType["LENDER"] = "LENDER";
})(SenderType || (exports.SenderType = SenderType = {}));
/** Message delivery status */
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
/** Subscription status */
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
    SubscriptionStatus["CANCELED"] = "CANCELED";
    SubscriptionStatus["INCOMPLETE"] = "INCOMPLETE";
    SubscriptionStatus["TRIALING"] = "TRIALING";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
/** Combined subscription tier (borrower + lender) */
var AllSubscriptionTier;
(function (AllSubscriptionTier) {
    AllSubscriptionTier["FREE"] = "FREE";
    AllSubscriptionTier["PLUS"] = "PLUS";
    AllSubscriptionTier["PRO"] = "PRO";
    AllSubscriptionTier["STARTER"] = "STARTER";
    AllSubscriptionTier["PROFESSIONAL"] = "PROFESSIONAL";
    AllSubscriptionTier["ENTERPRISE"] = "ENTERPRISE";
})(AllSubscriptionTier || (exports.AllSubscriptionTier = AllSubscriptionTier = {}));
/** User type for subscriptions */
var UserType;
(function (UserType) {
    UserType["BORROWER"] = "BORROWER";
    UserType["LENDER"] = "LENDER";
})(UserType || (exports.UserType = UserType = {}));
/** Zod schema for Message */
exports.MessageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    match_id: zod_1.z.string().uuid(),
    sender_id: zod_1.z.string().uuid(),
    sender_type: zod_1.z.nativeEnum(SenderType),
    content: zod_1.z.string().min(1).max(5000),
    encrypted: zod_1.z.boolean(),
    sent_at: zod_1.z.string().datetime(),
    delivered_at: zod_1.z.string().datetime().optional(),
    read_at: zod_1.z.string().datetime().optional(),
});
/** Zod schema for sending a message */
exports.SendMessageSchema = zod_1.z.object({
    match_id: zod_1.z.string().uuid(),
    content: zod_1.z.string().min(1).max(5000),
});
/** Zod schema for Subscription */
exports.SubscriptionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    user_type: zod_1.z.nativeEnum(UserType),
    tier: zod_1.z.nativeEnum(AllSubscriptionTier),
    store_customer_id: zod_1.z.string().min(1),
    store_subscription_id: zod_1.z.string().min(1),
    store_type: zod_1.z.enum(['APPLE', 'GOOGLE']),
    status: zod_1.z.nativeEnum(SubscriptionStatus),
    current_period_start: zod_1.z.string().datetime(),
    current_period_end: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
//# sourceMappingURL=message.js.map