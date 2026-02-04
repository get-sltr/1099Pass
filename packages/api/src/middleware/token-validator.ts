/**
 * Token Validation Middleware
 * Provides explicit JWT claim validation beyond API Gateway/Cognito
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UnauthorizedError, ForbiddenError } from './error-handler';

/**
 * Token claims from Cognito
 */
export interface TokenClaims {
  sub: string;
  email?: string;
  email_verified?: boolean;
  'custom:user_type'?: 'BORROWER' | 'LENDER';
  'custom:institution_id'?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  auth_time?: number;
  token_use?: string;
  'cognito:username'?: string;
}

/**
 * Validated user context
 */
export interface ValidatedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userType: 'BORROWER' | 'LENDER';
  institutionId?: string;
  username: string;
  tokenIssuedAt: Date;
  tokenExpiresAt: Date;
}

/**
 * Extract and parse claims from API Gateway event
 */
export function extractClaims(event: APIGatewayProxyEvent): TokenClaims | null {
  const claims = event.requestContext?.authorizer?.claims;

  if (!claims) {
    return null;
  }

  // Parse numeric claims
  const parsedClaims: TokenClaims = {
    ...claims,
    exp: claims.exp ? parseInt(claims.exp, 10) : undefined,
    iat: claims.iat ? parseInt(claims.iat, 10) : undefined,
    auth_time: claims.auth_time ? parseInt(claims.auth_time, 10) : undefined,
    email_verified:
      claims.email_verified === 'true' || claims.email_verified === true,
  };

  return parsedClaims;
}

/**
 * Validate token claims
 */
export function validateClaims(claims: TokenClaims): ValidatedUser {
  const now = Math.floor(Date.now() / 1000);

  // Validate required fields
  if (!claims.sub) {
    throw new UnauthorizedError('Token missing subject claim');
  }

  // Validate token expiration
  if (claims.exp && claims.exp < now) {
    throw new UnauthorizedError('Token has expired');
  }

  // Validate token was issued in the past
  if (claims.iat && claims.iat > now + 60) {
    // Allow 60 seconds clock skew
    throw new UnauthorizedError('Token issued in the future');
  }

  // Validate token use (should be 'id' for Cognito ID tokens)
  if (claims.token_use && claims.token_use !== 'id') {
    throw new UnauthorizedError('Invalid token type');
  }

  // Validate issuer format (should be Cognito user pool URL)
  if (claims.iss && !claims.iss.includes('cognito-idp')) {
    throw new UnauthorizedError('Invalid token issuer');
  }

  // Validate user type if present
  const userType = claims['custom:user_type'];
  if (userType && !['BORROWER', 'LENDER'].includes(userType)) {
    throw new ForbiddenError('Invalid user type');
  }

  return {
    id: claims.sub,
    email: claims.email || '',
    emailVerified: claims.email_verified || false,
    userType: userType || 'BORROWER',
    institutionId: claims['custom:institution_id'],
    username: claims['cognito:username'] || claims.sub,
    tokenIssuedAt: new Date((claims.iat || 0) * 1000),
    tokenExpiresAt: new Date((claims.exp || 0) * 1000),
  };
}

/**
 * Get validated user from event
 */
export function getValidatedUser(event: APIGatewayProxyEvent): ValidatedUser {
  const claims = extractClaims(event);

  if (!claims) {
    throw new UnauthorizedError('No authentication token provided');
  }

  return validateClaims(claims);
}

/**
 * Check if user has access to a resource
 */
export function validateResourceOwnership(
  user: ValidatedUser,
  resourceOwnerId: string,
  resourceType: string
): void {
  if (user.id !== resourceOwnerId) {
    throw new ForbiddenError(
      `User does not have access to this ${resourceType}`
    );
  }
}

/**
 * Check if lender has access to a borrower's data
 */
export function validateLenderAccess(
  user: ValidatedUser,
  _borrowerId: string,
  _accessType: 'view' | 'message'
): void {
  if (user.userType !== 'LENDER') {
    throw new ForbiddenError('Only lenders can access borrower data');
  }

  // Additional validation could check:
  // - Lender's subscription tier
  // - If lender has unlocked this borrower
  // - Geographic restrictions
  // - Lending criteria match
  // These would require database lookups
}

/**
 * Middleware type for validated handlers
 */
type ValidatedHandler = (
  event: APIGatewayProxyEvent,
  user: ValidatedUser
) => Promise<APIGatewayProxyResult>;

/**
 * Higher-order function that validates token and provides user context
 */
export function withTokenValidation(
  handler: ValidatedHandler
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const user = getValidatedUser(event);
    return handler(event, user);
  };
}

/**
 * Higher-order function that requires a specific user type
 */
export function requireUserType(
  userType: 'BORROWER' | 'LENDER',
  handler: ValidatedHandler
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const user = getValidatedUser(event);

    if (user.userType !== userType) {
      throw new ForbiddenError(`This endpoint requires ${userType} role`);
    }

    return handler(event, user);
  };
}

/**
 * Higher-order function that requires verified email
 */
export function requireVerifiedEmail(
  handler: ValidatedHandler
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const user = getValidatedUser(event);

    if (!user.emailVerified) {
      throw new ForbiddenError('Email verification required');
    }

    return handler(event, user);
  };
}

/**
 * Check token freshness (for sensitive operations)
 */
export function requireFreshToken(
  maxAgeMinutes: number,
  handler: ValidatedHandler
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult> {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const user = getValidatedUser(event);
    const claims = extractClaims(event)!;

    const authTime = claims.auth_time;
    if (!authTime) {
      throw new UnauthorizedError('Token missing auth_time claim');
    }

    const maxAgeSeconds = maxAgeMinutes * 60;
    const now = Math.floor(Date.now() / 1000);

    if (now - authTime > maxAgeSeconds) {
      throw new UnauthorizedError(
        'Token is too old for this operation. Please re-authenticate.'
      );
    }

    return handler(event, user);
  };
}
