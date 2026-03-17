import { z } from 'zod';
/** KYC verification status */
export declare enum KYCStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    VERIFIED = "VERIFIED",
    FAILED = "FAILED"
}
/** Borrower subscription tier */
export declare enum SubscriptionTier {
    FREE = "FREE",
    PLUS = "PLUS",
    PRO = "PRO"
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
export declare const BorrowerSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    date_of_birth: z.ZodString;
    street_address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip_code: z.ZodString;
    kyc_status: z.ZodNativeEnum<typeof KYCStatus>;
    subscription_tier: z.ZodNativeEnum<typeof SubscriptionTier>;
    cognito_sub: z.ZodString;
    profile_image_url: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
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
    created_at: string;
    updated_at: string;
    profile_image_url?: string | undefined;
}, {
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
    created_at: string;
    updated_at: string;
    profile_image_url?: string | undefined;
}>;
/** Zod schema for CreateBorrowerInput */
export declare const CreateBorrowerSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    date_of_birth: z.ZodString;
    street_address: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    zip_code: z.ZodString;
    cognito_sub: z.ZodString;
    profile_image_url: z.ZodOptional<z.ZodString>;
} & {
    kyc_status: z.ZodDefault<z.ZodNativeEnum<typeof KYCStatus>>;
    subscription_tier: z.ZodDefault<z.ZodNativeEnum<typeof SubscriptionTier>>;
}, "strip", z.ZodTypeAny, {
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
    profile_image_url?: string | undefined;
}, {
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    cognito_sub: string;
    kyc_status?: KYCStatus | undefined;
    subscription_tier?: SubscriptionTier | undefined;
    profile_image_url?: string | undefined;
}>;
/** Zod schema for UpdateBorrowerInput */
export declare const UpdateBorrowerSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    date_of_birth: z.ZodOptional<z.ZodString>;
    street_address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    zip_code: z.ZodOptional<z.ZodString>;
    kyc_status: z.ZodOptional<z.ZodNativeEnum<typeof KYCStatus>>;
    subscription_tier: z.ZodOptional<z.ZodNativeEnum<typeof SubscriptionTier>>;
    profile_image_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    date_of_birth?: string | undefined;
    street_address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    kyc_status?: KYCStatus | undefined;
    subscription_tier?: SubscriptionTier | undefined;
    profile_image_url?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    date_of_birth?: string | undefined;
    street_address?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    zip_code?: string | undefined;
    kyc_status?: KYCStatus | undefined;
    subscription_tier?: SubscriptionTier | undefined;
    profile_image_url?: string | undefined;
}>;
//# sourceMappingURL=borrower.d.ts.map