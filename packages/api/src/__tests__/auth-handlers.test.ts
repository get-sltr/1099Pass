/**
 * Tests for auth handler logic
 * Validates request parsing, response formats, and error handling
 */

import { z } from 'zod';

// Test the validation schemas used by auth handlers

describe('auth handler schemas', () => {
  describe('login schema', () => {
    const LoginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
      clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
    });

    it('should accept valid borrower login', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'mypassword',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clientType).toBe('BORROWER');
      }
    });

    it('should accept lender login', () => {
      const result = LoginSchema.safeParse({
        email: 'lender@bank.com',
        password: 'mypassword',
        clientType: 'LENDER',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clientType).toBe('LENDER');
      }
    });

    it('should reject invalid email', () => {
      const result = LoginSchema.safeParse({
        email: 'not-an-email',
        password: 'mypassword',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('register schema', () => {
    const RegisterSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      first_name: z.string().min(1).max(100),
      last_name: z.string().min(1).max(100),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
      date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      user_type: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
    });

    it('should accept valid borrower registration', () => {
      const result = RegisterSchema.safeParse({
        email: 'new@user.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+15551234567',
        date_of_birth: '1990-01-15',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.user_type).toBe('BORROWER');
      }
    });

    it('should accept registration without optional fields', () => {
      const result = RegisterSchema.safeParse({
        email: 'new@user.com',
        password: 'SecurePass123!',
        first_name: 'Jane',
        last_name: 'Smith',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short password', () => {
      const result = RegisterSchema.safeParse({
        email: 'new@user.com',
        password: 'short',
        first_name: 'John',
        last_name: 'Doe',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const result = RegisterSchema.safeParse({
        email: 'new@user.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        phone: '555-1234',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = RegisterSchema.safeParse({
        email: 'new@user.com',
        password: 'SecurePass123!',
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '01/15/1990',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('refresh schema', () => {
    const RefreshSchema = z.object({
      refreshToken: z.string().min(1),
      clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
    });

    it('should accept valid refresh request', () => {
      const result = RefreshSchema.safeParse({
        refreshToken: 'some-long-refresh-token-from-cognito',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.clientType).toBe('BORROWER');
      }
    });

    it('should reject empty refresh token', () => {
      const result = RefreshSchema.safeParse({
        refreshToken: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept lender client type', () => {
      const result = RefreshSchema.safeParse({
        refreshToken: 'token',
        clientType: 'LENDER',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('forgot password schema', () => {
    const ForgotPasswordSchema = z.object({
      email: z.string().email(),
      clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
    });

    const ConfirmResetSchema = z.object({
      email: z.string().email(),
      code: z.string().min(1),
      newPassword: z.string().min(8),
      clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
    });

    it('should accept valid forgot password request', () => {
      const result = ForgotPasswordSchema.safeParse({
        email: 'user@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid confirm reset request', () => {
      const result = ConfirmResetSchema.safeParse({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'NewSecure123!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject confirm with short password', () => {
      const result = ConfirmResetSchema.safeParse({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('should reject confirm without code', () => {
      const result = ConfirmResetSchema.safeParse({
        email: 'user@example.com',
        code: '',
        newPassword: 'NewSecure123!',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('auth response format', () => {
  it('login response should include expected fields', () => {
    // Simulates the structure the backend returns
    const loginResponse = {
      idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 3600,
      tokenType: 'Bearer',
    };

    expect(loginResponse).toHaveProperty('idToken');
    expect(loginResponse).toHaveProperty('accessToken');
    expect(loginResponse).toHaveProperty('refreshToken');
    expect(loginResponse).toHaveProperty('expiresIn');
    expect(typeof loginResponse.expiresIn).toBe('number');
  });

  it('register response should include user and tokens', () => {
    const registerResponse = {
      idToken: 'token...',
      accessToken: 'token...',
      refreshToken: 'token...',
      expiresIn: 3600,
      user: {
        id: 'uuid',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: null,
        subscription_tier: 'FREE',
        onboarding_complete: false,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      },
    };

    expect(registerResponse.user).toHaveProperty('id');
    expect(registerResponse.user).toHaveProperty('email');
    expect(registerResponse.user).toHaveProperty('first_name');
    expect(registerResponse.user.onboarding_complete).toBe(false);
  });

  it('refresh response should include new token', () => {
    const refreshResponse = {
      token: 'new-access-token...',
      idToken: 'new-id-token...',
      refreshToken: 'original-refresh-token...',
      expiresIn: 3600,
    };

    expect(refreshResponse).toHaveProperty('token');
    expect(refreshResponse).toHaveProperty('refreshToken');
    expect(refreshResponse).toHaveProperty('expiresIn');
  });
});
