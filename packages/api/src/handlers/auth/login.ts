/**
 * POST /auth/login
 * Authenticate with email + password, return Cognito tokens.
 * No Cognito authorizer on this route (public).
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import { handleError } from '../../middleware/error-handler';
import { withRateLimit } from '../../middleware/rate-limiter';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
});

function getLoginIdentifier(event: { body?: string | null }): string {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    return body.email?.toLowerCase() || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

const rateLimitedLogin = withRateLimit(5, 300, getLoginIdentifier);

export const handler: APIGatewayProxyHandler = rateLimitedLogin(async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
      };
    }

    const { email, password, clientType } = parsed.data;
    const userPoolId = process.env.USER_POOL_ID;
    const borrowerClientId = process.env.COGNITO_BORROWER_CLIENT_ID;
    const lenderClientId = process.env.COGNITO_LENDER_CLIENT_ID;

    if (!userPoolId || !borrowerClientId || !lenderClientId) {
      console.error('Missing Cognito env: USER_POOL_ID, COGNITO_BORROWER_CLIENT_ID, COGNITO_LENDER_CLIENT_ID');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const clientId = clientType === 'LENDER' ? lenderClientId : borrowerClientId;
    const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await client.send(command);

    if (response.ChallengeName) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeName: response.ChallengeName,
          session: response.Session,
          parameters: response.ChallengeParameters,
        }),
      };
    }

    const result = response.AuthenticationResult;
    if (!result?.IdToken || !result.AccessToken) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Authentication failed' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: result.IdToken,
        accessToken: result.AccessToken,
        refreshToken: result.RefreshToken,
        expiresIn: result.ExpiresIn,
        tokenType: result.TokenType || 'Bearer',
      }),
    };
  } catch (err) {
    const e = err as Error & { name?: string };
    if (e.name === 'NotAuthorizedException' || e.name === 'UserNotFoundException') {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }
    return handleError(err);
  }
});
