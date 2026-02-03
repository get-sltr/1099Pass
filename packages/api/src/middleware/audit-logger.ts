import { APIGatewayProxyEvent } from 'aws-lambda';
import { query } from '../db/client';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

interface AuditEventParams {
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  performedBy?: string;
  ipAddress?: string;
}

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  await query(
    `INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      params.tableName,
      params.recordId,
      params.action,
      params.oldData ? JSON.stringify(params.oldData) : null,
      params.newData ? JSON.stringify(params.newData) : null,
      params.performedBy ?? null,
      params.ipAddress ?? null,
    ]
  );
}

export function extractIpAddress(event: APIGatewayProxyEvent): string | undefined {
  return event.requestContext.identity?.sourceIp;
}
