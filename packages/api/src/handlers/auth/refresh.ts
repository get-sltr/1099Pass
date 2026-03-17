/**
 * POST /auth/refresh
 * Refresh Cognito tokens using a refresh token.
 * No Cognito authorizer on this route (public).
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';

const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
  clientType: z.enum(['BORROWER', 'LENDER']).optional().default('BORROWER'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const parsed = RefreshSchema.safeParse(body);
    if (!parsed.success) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
      };
    }

    const { refreshToken, clientType } = parsed.data;
    const borrowerClientId = process.env.COGNITO_BORROWER_CLIENT_ID;
    const lenderClientId = process.env.COGNITO_LENDER_CLIENT_ID;

    if (!borrowerClientId || !lenderClientId) {
      console.error('Missing Cognito client IDs');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Server configuration error' }),
      };
    }

    const clientId = clientType === 'LENDER' ? lenderClientId : borrowerClientId;
    const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await client.send(command);
    const result = response.AuthenticationResult;

    if (!result?.IdToken || !result.AccessToken) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Token refresh failed' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: result.AccessToken,
        idToken: result.IdToken,
        // Cognito REFRESH_TOKEN_AUTH does not return a new refresh token
        // so we echo the original one back
        refreshToken,
        expiresIn: result.ExpiresIn,
      }),
    };
  } catch (err) {
    const e = err as Error & { name?: string };
    if (e.name === 'NotAuthorizedException') {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Refresh token expired or revoked' }),
      };
    }
    console.error('Token refresh error:', e.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
