import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { withErrorHandler, NotFoundError } from '../../middleware/error-handler';
import { requireRole, AuthenticatedEvent } from '../../middleware/auth-middleware';
import * as borrowerRepository from '../../db/repositories/borrower-repository';

async function handleGetProfile(event: AuthenticatedEvent, _context: Context): Promise<APIGatewayProxyResult> {
  const borrower = await borrowerRepository.findByCognitoSub(event.user.cognitoSub);

  if (!borrower) {
    throw new NotFoundError('Borrower profile');
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: borrower }),
  };
}

export const handler = withErrorHandler(requireRole('BORROWER')(handleGetProfile));
