import { z } from 'zod';
/** Type of message sender */
export declare enum SenderType {
    BORROWER = "BORROWER",
    LENDER = "LENDER"
}
/** Message delivery status */
export declare enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ"
}
/** Chat message */
export interface Message {
    id: string;
    match_id: string;
    sender_id: string;
    sender_type: SenderType;
    content: string;
    encrypted: boolean;
    sent_at: string;
    delivered_at?: string;
    read_at?: string;
}
/** Conversation summary (derived from match + messages) */
export interface Conversation {
    match_id: string;
    counterpart_id: string;
    counterpart_name: string;
    counterpart_type: SenderType;
    last_message?: string;
    last_message_at?: string;
    unread_count: number;
}
/** Subscription status */
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    PAST_DUE = "PAST_DUE",
    CANCELED = "CANCELED",
    INCOMPLETE = "INCOMPLETE",
    TRIALING = "TRIALING"
}
/** Combined subscription tier (borrower + lender) */
export declare enum AllSubscriptionTier {
    FREE = "FREE",
    PLUS = "PLUS",
    PRO = "PRO",
    STARTER = "STARTER",
    PROFESSIONAL = "PROFESSIONAL",
    ENTERPRISE = "ENTERPRISE"
}
/** User type for subscriptions */
export declare enum UserType {
    BORROWER = "BORROWER",
    LENDER = "LENDER"
}
/** Subscription record */
export interface Subscription {
    id: string;
    user_id: string;
    user_type: UserType;
    tier: AllSubscriptionTier;
    store_customer_id: string;
    store_subscription_id: string;
    store_type: 'APPLE' | 'GOOGLE';
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string;
    created_at: string;
    updated_at: string;
}
/** Zod schema for Message */
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    match_id: z.ZodString;
    sender_id: z.ZodString;
    sender_type: z.ZodNativeEnum<typeof SenderType>;
    content: z.ZodString;
    encrypted: z.ZodBoolean;
    sent_at: z.ZodString;
    delivered_at: z.ZodOptional<z.ZodString>;
    read_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    encrypted: boolean;
    match_id: string;
    sender_id: string;
    sender_type: SenderType;
    content: string;
    sent_at: string;
    delivered_at?: string | undefined;
    read_at?: string | undefined;
}, {
    id: string;
    encrypted: boolean;
    match_id: string;
    sender_id: string;
    sender_type: SenderType;
    content: string;
    sent_at: string;
    delivered_at?: string | undefined;
    read_at?: string | undefined;
}>;
/** Zod schema for sending a message */
export declare const SendMessageSchema: z.ZodObject<{
    match_id: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    match_id: string;
    content: string;
}, {
    match_id: string;
    content: string;
}>;
/** Zod schema for Subscription */
export declare const SubscriptionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    user_type: z.ZodNativeEnum<typeof UserType>;
    tier: z.ZodNativeEnum<typeof AllSubscriptionTier>;
    store_customer_id: z.ZodString;
    store_subscription_id: z.ZodString;
    store_type: z.ZodEnum<["APPLE", "GOOGLE"]>;
    status: z.ZodNativeEnum<typeof SubscriptionStatus>;
    current_period_start: z.ZodString;
    current_period_end: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
    user_id: string;
    user_type: UserType;
    tier: AllSubscriptionTier;
    store_customer_id: string;
    store_subscription_id: string;
    store_type: "APPLE" | "GOOGLE";
    current_period_start: string;
    current_period_end: string;
}, {
    id: string;
    status: SubscriptionStatus;
    created_at: string;
    updated_at: string;
    user_id: string;
    user_type: UserType;
    tier: AllSubscriptionTier;
    store_customer_id: string;
    store_subscription_id: string;
    store_type: "APPLE" | "GOOGLE";
    current_period_start: string;
    current_period_end: string;
}>;
//# sourceMappingURL=message.d.ts.map