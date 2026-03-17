/**
 * POST /auth/logout
 * Revoke all tokens for the authenticated user via Cognito GlobalSignOut.
 * Requires a valid access token (Cognito authorizer on this route).
 */

import { APIGatewayProxyHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
  RevokeTokenCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { handleError } from '../../middleware/error-handler';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Extract the access token from Authorization header
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No access token provided' }),
      };
    }

    const client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    // GlobalSignOut invalidates ALL refresh tokens and access tokens for this user
    await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }));

    // Optionally revoke the refresh token if provided in the body
    const body = event.body ? JSON.parse(event.body) : {};
    if (body.refreshToken) {
      const clientId =
        body.clientType === 'LENDER'
          ? process.env.COGNITO_LENDER_CLIENT_ID
          : process.env.COGNITO_BORROWER_CLIENT_ID;

      if (clientId) {
        await client.send(
          new RevokeTokenCommand({
            Token: body.refreshToken,
            ClientId: clientId,
          })
        );
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Logged out successfully' }),
    };
  } catch (err) {
    const e = err as Error & { name?: string };

    // Token already expired or revoked — still a successful logout from the client's perspective
    if (e.name === 'NotAuthorizedException') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Session already expired' }),
      };
    }

    return handleError(err);
  }
};
