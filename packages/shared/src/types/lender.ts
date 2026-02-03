import { z } from 'zod';

/** Type of lending institution */
export enum LenderType {
  BANK = 'BANK',
  CREDIT_UNION = 'CREDIT_UNION',
  MORTGAGE_COMPANY = 'MORTGAGE_COMPANY',
  FINTECH = 'FINTECH',
  OTHER = 'OTHER',
}

/** Lender subscription plan tier */
export enum LenderPlanTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

/** Lender account status */
export enum LenderStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/** Lender institution profile */
export interface Lender {
  id: string;
  institution_name: string;
  license_number: string;
  lender_type: LenderType;
  status: LenderStatus;
  plan_tier: LenderPlanTier;
  verified: boolean;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  website_url?: string;
  logo_url?: string;
  description?: string;
  cognito_sub: string;
  created_at: string;
  updated_at: string;
}

/** Input for creating a lender */
export type CreateLenderInput = Omit<Lender, 'id' | 'created_at' | 'updated_at' | 'status' | 'verified'> & {
  status?: LenderStatus;
  verified?: boolean;
};

/** Input for updating a lender */
export type UpdateLenderInput = Partial<Omit<Lender, 'id' | 'created_at' | 'updated_at' | 'cognito_sub'>>;

/** Zod schema for Lender */
export const LenderSchema = z.object({
  id: z.string().uuid(),
  institution_name: z.string().min(1).max(255),
  license_number: z.string().min(1).max(100),
  lender_type: z.nativeEnum(LenderType),
  status: z.nativeEnum(LenderStatus),
  plan_tier: z.nativeEnum(LenderPlanTier),
  verified: z.boolean(),
  primary_contact_name: z.string().min(1).max(200),
  primary_contact_email: z.string().email(),
  primary_contact_phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  website_url: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  cognito_sub: z.string().min(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/** Zod schema for CreateLenderInput */
export const CreateLenderSchema = LenderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: z.nativeEnum(LenderStatus).default(LenderStatus.PENDING),
  verified: z.boolean().default(false),
});

/** Zod schema for UpdateLenderInput */
export const UpdateLenderSchema = LenderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  cognito_sub: true,
}).partial();
