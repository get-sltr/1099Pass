import { z } from 'zod';
/** Type of lending institution */
export declare enum LenderType {
    BANK = "BANK",
    CREDIT_UNION = "CREDIT_UNION",
    MORTGAGE_COMPANY = "MORTGAGE_COMPANY",
    FINTECH = "FINTECH",
    OTHER = "OTHER"
}
/** Lender subscription plan tier */
export declare enum LenderPlanTier {
    STARTER = "STARTER",
    PROFESSIONAL = "PROFESSIONAL",
    ENTERPRISE = "ENTERPRISE"
}
/** Lender account status */
export declare enum LenderStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED"
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
export declare const LenderSchema: z.ZodObject<{
    id: z.ZodString;
    institution_name: z.ZodString;
    license_number: z.ZodString;
    lender_type: z.ZodNativeEnum<typeof LenderType>;
    status: z.ZodNativeEnum<typeof LenderStatus>;
    plan_tier: z.ZodNativeEnum<typeof LenderPlanTier>;
    verified: z.ZodBoolean;
    primary_contact_name: z.ZodString;
    primary_contact_email: z.ZodString;
    primary_contact_phone: z.ZodString;
    website_url: z.ZodOptional<z.ZodString>;
    logo_url: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    cognito_sub: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: LenderStatus;
    cognito_sub: string;
    created_at: string;
    updated_at: string;
    institution_name: string;
    license_number: string;
    lender_type: LenderType;
    plan_tier: LenderPlanTier;
    verified: boolean;
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}, {
    id: string;
    status: LenderStatus;
    cognito_sub: string;
    created_at: string;
    updated_at: string;
    institution_name: string;
    license_number: string;
    lender_type: LenderType;
    plan_tier: LenderPlanTier;
    verified: boolean;
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}>;
/** Zod schema for CreateLenderInput */
export declare const CreateLenderSchema: z.ZodObject<{
    cognito_sub: z.ZodString;
    institution_name: z.ZodString;
    license_number: z.ZodString;
    lender_type: z.ZodNativeEnum<typeof LenderType>;
    plan_tier: z.ZodNativeEnum<typeof LenderPlanTier>;
    primary_contact_name: z.ZodString;
    primary_contact_email: z.ZodString;
    primary_contact_phone: z.ZodString;
    website_url: z.ZodOptional<z.ZodString>;
    logo_url: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
} & {
    status: z.ZodDefault<z.ZodNativeEnum<typeof LenderStatus>>;
    verified: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status: LenderStatus;
    cognito_sub: string;
    institution_name: string;
    license_number: string;
    lender_type: LenderType;
    plan_tier: LenderPlanTier;
    verified: boolean;
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}, {
    cognito_sub: string;
    institution_name: string;
    license_number: string;
    lender_type: LenderType;
    plan_tier: LenderPlanTier;
    primary_contact_name: string;
    primary_contact_email: string;
    primary_contact_phone: string;
    status?: LenderStatus | undefined;
    verified?: boolean | undefined;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}>;
/** Zod schema for UpdateLenderInput */
export declare const UpdateLenderSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof LenderStatus>>;
    institution_name: z.ZodOptional<z.ZodString>;
    license_number: z.ZodOptional<z.ZodString>;
    lender_type: z.ZodOptional<z.ZodNativeEnum<typeof LenderType>>;
    plan_tier: z.ZodOptional<z.ZodNativeEnum<typeof LenderPlanTier>>;
    verified: z.ZodOptional<z.ZodBoolean>;
    primary_contact_name: z.ZodOptional<z.ZodString>;
    primary_contact_email: z.ZodOptional<z.ZodString>;
    primary_contact_phone: z.ZodOptional<z.ZodString>;
    website_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    logo_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: LenderStatus | undefined;
    institution_name?: string | undefined;
    license_number?: string | undefined;
    lender_type?: LenderType | undefined;
    plan_tier?: LenderPlanTier | undefined;
    verified?: boolean | undefined;
    primary_contact_name?: string | undefined;
    primary_contact_email?: string | undefined;
    primary_contact_phone?: string | undefined;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}, {
    status?: LenderStatus | undefined;
    institution_name?: string | undefined;
    license_number?: string | undefined;
    lender_type?: LenderType | undefined;
    plan_tier?: LenderPlanTier | undefined;
    verified?: boolean | undefined;
    primary_contact_name?: string | undefined;
    primary_contact_email?: string | undefined;
    primary_contact_phone?: string | undefined;
    website_url?: string | undefined;
    logo_url?: string | undefined;
    description?: string | undefined;
}>;
//# sourceMappingURL=lender.d.ts.map