/**
 * POST /auth/register
 * Full signup flow: create Cognito user → create DB borrower record → return tokens.
 * No Cognito authorizer on this route (public).
 */

import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import { withErrorHandler } from '../../middleware/error-handler';
import * as borrowerRepository from '../../db/repositories/borrower-repository';
import { KYCStatus, SubscriptionTier } from '@1099pass/shared';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  user_type: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
});

async function handleRegister(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  const body = event.body ? JSON.parse(event.body) : {};
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
    };
  }

  const { email, password, first_name, last_name, phone, date_of_birth, user_type } = parsed.data;

  const userPoolId = process.env.USER_POOL_ID;
  const borrowerClientId = process.env.COGNITO_BORROWER_CLIENT_ID;
  const lenderClientId = process.env.COGNITO_LENDER_CLIENT_ID;

  if (!userPoolId || !borrowerClientId || !lenderClientId) {
    console.error('Missing Cognito env vars');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const clientId = user_type === 'LENDER' ? lenderClientId : borrowerClientId;
  const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

  try {
    // Step 1: Create Cognito user
    const signUpResponse = await cognitoClient.send(new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: `${first_name} ${last_name}` },
        ...(phone ? [{ Name: 'phone_number', Value: phone }] : []),
        { Name: 'custom:user_type', Value: user_type },
      ],
    }));

    const cognitoSub = signUpResponse.UserSub;
    if (!cognitoSub) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to create user account' }),
      };
    }

    // Step 2: Auto-confirm the user (admin action)
    // In production, you may use email verification instead via a pre-signup Lambda trigger
    try {
      await cognitoClient.send(new AdminConfirmSignUpCommand({
        UserPoolId: userPoolId,
        Username: email,
      }));
    } catch (confirmErr) {
      // If auto-confirm fails (e.g., already confirmed via trigger), continue
      console.log('Auto-confirm note:', (confirmErr as Error).message);
    }

    // Step 3: Create borrower record in database
    if (user_type === 'BORROWER') {
      const borrower = await borrowerRepository.create({
        email,
        phone: phone || '',
        first_name,
        last_name,
        date_of_birth: date_of_birth || '1990-01-01',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        kyc_status: KYCStatus.PENDING,
        subscription_tier: SubscriptionTier.FREE,
        cognito_sub: cognitoSub,
      });

      // Step 4: Authenticate to get tokens
      try {
        const authResponse = await cognitoClient.send(new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: clientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        }));

        const result = authResponse.AuthenticationResult;
        if (result?.AccessToken && result?.IdToken) {
          return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: result.IdToken,
              accessToken: result.AccessToken,
              refreshToken: result.RefreshToken,
              expiresIn: result.ExpiresIn,
              user: {
                id: borrower.id,
                email: borrower.email,
                first_name: borrower.first_name,
                last_name: borrower.last_name,
                phone: borrower.phone || null,
                subscription_tier: borrower.subscription_tier,
                onboarding_complete: false,
                created_at: borrower.created_at,
                updated_at: borrower.updated_at,
              },
            }),
          };
        }
      } catch (authErr) {
        // User created but couldn't auto-login; client can login separately
        console.log('Auto-login after signup failed:', (authErr as Error).message);
      }

      // Fallback: return user without tokens (client will need to login)
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            id: borrower.id,
            email: borrower.email,
            first_name: borrower.first_name,
            last_name: borrower.last_name,
            phone: borrower.phone || null,
            subscription_tier: borrower.subscription_tier,
            onboarding_complete: false,
            created_at: borrower.created_at,
            updated_at: borrower.updated_at,
          },
          message: 'Account created. Please login.',
        }),
      };
    }

    // Lender registration placeholder
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Lender registration pending verification' }),
    };
  } catch (err) {
    const e = err as Error & { name?: string };

    if (e.name === 'UsernameExistsException') {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'An account with this email already exists' }),
      };
    }
    if (e.name === 'InvalidPasswordException') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Password does not meet requirements. Use 8+ characters with uppercase, lowercase, numbers, and symbols.' }),
      };
    }

    console.error('Registration error:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Registration failed. Please try again.' }),
    };
  }
}

export const handler = withErrorHandler(handleRegister);
