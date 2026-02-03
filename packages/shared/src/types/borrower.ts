import { z } from 'zod';

/** KYC verification status */
export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
}

/** Borrower subscription tier */
export enum SubscriptionTier {
  FREE = 'FREE',
  PLUS = 'PLUS',
  PRO = 'PRO',
}

/** Borrower profile */
export interface Borrower {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  kyc_status: KYCStatus;
  subscription_tier: SubscriptionTier;
  cognito_sub: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

/** Input for creating a borrower */
export type CreateBorrowerInput = Omit<Borrower, 'id' | 'created_at' | 'updated_at' | 'kyc_status' | 'subscription_tier'> & {
  kyc_status?: KYCStatus;
  subscription_tier?: SubscriptionTier;
};

/** Input for updating a borrower */
export type UpdateBorrowerInput = Partial<Omit<Borrower, 'id' | 'created_at' | 'updated_at' | 'cognito_sub'>>;

/** Zod schema for Borrower */
export const BorrowerSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  street_address: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/),
  kyc_status: z.nativeEnum(KYCStatus),
  subscription_tier: z.nativeEnum(SubscriptionTier),
  cognito_sub: z.string().min(1),
  profile_image_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/** Zod schema for CreateBorrowerInput */
export const CreateBorrowerSchema = BorrowerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  kyc_status: z.nativeEnum(KYCStatus).default(KYCStatus.PENDING),
  subscription_tier: z.nativeEnum(SubscriptionTier).default(SubscriptionTier.FREE),
});

/** Zod schema for UpdateBorrowerInput */
export const UpdateBorrowerSchema = BorrowerSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  cognito_sub: true,
}).partial();
