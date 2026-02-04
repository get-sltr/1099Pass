import { z } from 'zod';

/** Type of message sender */
export enum SenderType {
  BORROWER = 'BORROWER',
  LENDER = 'LENDER',
}

/** Message delivery status */
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
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
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
  TRIALING = 'TRIALING',
}

/** Combined subscription tier (borrower + lender) */
export enum AllSubscriptionTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

/** User type for subscriptions */
export enum UserType {
  BORROWER = 'BORROWER',
  LENDER = 'LENDER',
}

/** Subscription record */
export interface Subscription {
  id: string;
  user_id: string;
  user_type: UserType;
  tier: AllSubscriptionTier;
  store_customer_id: string; // Apple App Store or Google Play customer ID
  store_subscription_id: string; // Apple/Google subscription ID
  store_type: 'APPLE' | 'GOOGLE'; // Which app store
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

/** Zod schema for Message */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  sender_type: z.nativeEnum(SenderType),
  content: z.string().min(1).max(5000),
  encrypted: z.boolean(),
  sent_at: z.string().datetime(),
  delivered_at: z.string().datetime().optional(),
  read_at: z.string().datetime().optional(),
});

/** Zod schema for sending a message */
export const SendMessageSchema = z.object({
  match_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
});

/** Zod schema for Subscription */
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  user_type: z.nativeEnum(UserType),
  tier: z.nativeEnum(AllSubscriptionTier),
  store_customer_id: z.string().min(1),
  store_subscription_id: z.string().min(1),
  store_type: z.enum(['APPLE', 'GOOGLE']),
  status: z.nativeEnum(SubscriptionStatus),
  current_period_start: z.string().datetime(),
  current_period_end: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
