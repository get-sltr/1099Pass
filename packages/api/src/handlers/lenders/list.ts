/**
 * GET /lenders
 * List lenders from the professional directory
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { withAuth, type AuthenticatedEvent } from '../../middleware/auth-middleware';
import { errorHandler } from '../../middleware/error-handler';
import { query } from '../../db/client';

interface LenderRow {
  id: string;
  institution_name: string;
  license_number: string;
  lender_type: string;
  status: string;
  plan_tier: string;
  verified: boolean;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  website_url: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: Date;
}

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const { requestId, queryStringParameters } = event;

  try {
    const lenderType = queryStringParameters?.type;
    const limit = parseInt(queryStringParameters?.limit || '50', 10);
    const offset = parseInt(queryStringParameters?.offset || '0', 10);

    let sql = `SELECT * FROM lenders WHERE status = 'ACTIVE'`;
    const params: unknown[] = [];
    let paramIndex = 1;

    if (lenderType) {
      sql += ` AND lender_type = $${paramIndex}`;
      params.push(lenderType);
      paramIndex++;
    }

    sql += ` ORDER BY verified DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query<LenderRow>(sql, params);

    const lenders = result.rows.map((row) => ({
      id: row.id,
      name: row.institution_name,
      description: row.description || '',
      logoUrl: row.logo_url,
      lenderType: row.lender_type,
      isVerified: row.verified,
      isFeatured: row.plan_tier === 'ENTERPRISE',
      licenseNumber: row.license_number,
      website: row.website_url,
      contactName: row.primary_contact_name,
      createdAt: row.created_at.toISOString(),
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
      body: JSON.stringify(lenders),
    };
  } catch (error) {
    return errorHandler(error as Error, requestId);
  }
}

export const main = withAuth(handler);
