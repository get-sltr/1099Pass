import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from 'aws-lambda';
import { z } from 'zod';
import { withErrorHandler } from '../../middleware/error-handler';
import { validateBody } from '../../middleware/request-validator';
import * as borrowerRepository from '../../db/repositories/borrower-repository';
import { KYCStatus, SubscriptionTier } from '@1099pass/shared';

const RegisterSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cognito_sub: z.string().min(1),
  user_type: z.enum(['BORROWER', 'LENDER']),
});

async function handleRegister(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  const body = validateBody(RegisterSchema, event.body);

  if (body.user_type === 'BORROWER') {
    const borrower = await borrowerRepository.create({
      email: body.email,
      phone: body.phone,
      first_name: body.first_name,
      last_name: body.last_name,
      date_of_birth: body.date_of_birth,
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      kyc_status: KYCStatus.PENDING,
      subscription_tier: SubscriptionTier.FREE,
      cognito_sub: body.cognito_sub,
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: borrower }),
    };
  }

  // Lender registration would go here
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { message: 'Lender registration pending' } }),
  };
}

export const handler = withErrorHandler(handleRegister);
