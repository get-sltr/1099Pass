import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { UnauthorizedError, ForbiddenError } from './error-handler';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  userType: 'BORROWER' | 'LENDER';
  cognitoSub: string;
}

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user: AuthenticatedUser;
}

export function extractUserFromEvent(event: APIGatewayProxyEvent): AuthenticatedUser | null {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) return null;

  return {
    userId: claims.sub as string,
    email: claims.email as string,
    userType: (claims['custom:user_type'] as 'BORROWER' | 'LENDER') || 'BORROWER',
    cognitoSub: claims.sub as string,
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

    return handler(authenticatedEvent, context);
  };
}

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
