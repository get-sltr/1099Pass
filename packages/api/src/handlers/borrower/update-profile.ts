/**
 * PUT /borrower/profile
 * Update borrower profile for the authenticated user
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { validateRequest } from '../../middleware/request-validator';
import { errorHandler } from '../../middleware/error-handler';
import * as borrowerRepository from '../../db/repositories/borrower-repository';
import { auditLog } from '../../middleware/audit-logger';

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  zip_code: z.string().optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { body, user, requestId } = event;

  const validation = validateRequest(UpdateProfileSchema, body);
  if (!validation.success) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ error: 'Invalid request', details: validation.error }),
    };
  }

  try {
    const borrower = await borrowerRepository.findByCognitoSub(user.sub);
    if (!borrower) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
        body: JSON.stringify({ error: 'Borrower profile not found' }),
      };
    }

    const updates: Record<string, string> = {};
    const data = validation.data;
    if (data.firstName) updates.first_name = data.firstName;
    if (data.lastName) updates.last_name = data.lastName;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.street_address !== undefined) updates.street_address = data.street_address;
    if (data.city !== undefined) updates.city = data.city;
    if (data.state !== undefined) updates.state = data.state;
    if (data.zip_code !== undefined) updates.zip_code = data.zip_code;
    if (data.date_of_birth !== undefined) updates.date_of_birth = data.date_of_birth;

    const updated = await borrowerRepository.update(borrower.id, updates);

    await auditLog({
      action: 'PROFILE_UPDATED',
      userId: user.sub,
      resourceType: 'BORROWER',
      resourceId: borrower.id,
      requestId,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify({ data: updated }),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
