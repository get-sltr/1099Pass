import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UnauthorizedError, ForbiddenError } from './error-handler';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: 'BORROWER' | 'LENDER';
  cognitoSub: string;
  // Aliases for handler compatibility
  sub: string;
  name: string;
}

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user: AuthenticatedUser;
  requestId: string;
}

export function extractUserFromEvent(event: APIGatewayProxyEvent): AuthenticatedUser | null {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) return null;

  const sub = claims.sub as string;
  const email = claims.email as string;
  const name = (claims.name as string) || email.split('@')[0] || 'User';

  return {
    userId: sub,
    email,
    userType: (claims['custom:user_type'] as 'BORROWER' | 'LENDER') || 'BORROWER',
    cognitoSub: sub,
    // Aliases for handler compatibility
    sub,
    name,
  };
}

type AuthenticatedHandler = (
  event: AuthenticatedEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export function requireAuth(handler: AuthenticatedHandler) {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const user = extractUserFromEvent(event);
    if (!user) throw new UnauthorizedError('Authentication required');

    const authenticatedEvent = event as AuthenticatedEvent;
    authenticatedEvent.user = user;
    authenticatedEvent.requestId = event.requestContext.requestId || context.awsRequestId || uuidv4();

    return handler(authenticatedEvent, context);
  };
}

// Alias for handler compatibility
export const withAuth = requireAuth;

export function requireRole(role: 'BORROWER' | 'LENDER') {
  return (handler: AuthenticatedHandler) => {
    return requireAuth(async (event, context) => {
      if (event.user.userType !== role) {
        throw new ForbiddenError(`This action requires ${role} role`);
      }
      return handler(event, context);
    });
  };
}
