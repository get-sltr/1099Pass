/**
 * POST /auth/forgot-password
 * POST /auth/forgot-password/confirm
 *
 * Cognito forgot-password flow:
 *   1. User requests reset → Cognito sends verification code to email
 *   2. User submits code + new password → Cognito resets password
 *
 * No Cognito authorizer on these routes (public).
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import { withRateLimit } from '../../middleware/rate-limiter';

// Step 1: Request password reset (sends code to email)
const ForgotPasswordSchema = z.object({
  email: z.string().email(),
  clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
});

// Step 2: Confirm with code + new password
const ConfirmResetSchema = z.object({
  email: z.string().email(),
  code: z.string().min(1),
  newPassword: z.string().min(8),
  clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
});

function getClientId(clientType: 'BORROWER' | 'LENDER'): string {
  const borrowerClientId = process.env.COGNITO_BORROWER_CLIENT_ID;
  const lenderClientId = process.env.COGNITO_LENDER_CLIENT_ID;

  if (!borrowerClientId || !lenderClientId) {
    throw new Error('Missing Cognito client IDs');
  }

  return clientType === 'LENDER' ? lenderClientId : borrowerClientId;
}

function getEmailFromEvent(event: { body?: string | null }): string {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    return body.email?.toLowerCase() || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

// Rate limit: 3 attempts per 5 minutes per email
const rateLimitedForgotPassword = withRateLimit(3, 300, getEmailFromEvent);

export const handler: APIGatewayProxyHandler = rateLimitedForgotPassword(async (event) => {
  const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

  try {
    const body = event.body ? JSON.parse(event.body) : {};

    // Determine which step based on whether code is provided
    if (body.code) {
      // Step 2: Confirm password reset
      const parsed = ConfirmResetSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        };
      }

      const { email, code, newPassword, clientType } = parsed.data;
      const clientId = getClientId(clientType);

      await client.send(new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Password reset successful' }),
      };
    } else {
      // Step 1: Request password reset
      const parsed = ForgotPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        };
      }

      const { email, clientType } = parsed.data;
      const clientId = getClientId(clientType);

      await client.send(new ForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'If an account exists with that email, a reset code has been sent.',
        }),
      };
    }
  } catch (err) {
    const e = err as Error & { name?: string };

    if (e.name === 'CodeMismatchException') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid or expired code' }),
      };
    }
    if (e.name === 'ExpiredCodeException') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Code has expired. Please request a new one.' }),
      };
    }
    if (e.name === 'InvalidPasswordException') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Password does not meet requirements' }),
      };
    }
    if (e.name === 'UserNotFoundException') {
      // Don't reveal whether the user exists
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'If an account exists with that email, a reset code has been sent.',
        }),
      };
    }
    if (e.message === 'Missing Cognito client IDs') {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    console.error('Forgot password error:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
});
