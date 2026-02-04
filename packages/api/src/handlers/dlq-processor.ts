/**
 * Dead Letter Queue Processor
 * Handles messages that failed processing in the main queue
 */

import { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sqs = new SQSClient({});
const sns = new SNSClient({});

interface DLQMessage {
  originalMessage: unknown;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  failedAt: string;
  retryCount: number;
  originalQueueUrl: string;
  receiptHandle?: string;
}

interface ProcessingResult {
  messageId: string;
  action: 'retried' | 'discarded' | 'escalated';
  reason: string;
}

const MAX_RETRY_COUNT = 3;
const ALERT_TOPIC_ARN = process.env.ALERT_TOPIC_ARN;
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

/**
 * Process DLQ messages
 */
export async function handler(
  event: SQSEvent,
  context: Context
): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> {
  const results: ProcessingResult[] = [];
  const failures: { itemIdentifier: string }[] = [];

  console.info(
    JSON.stringify({
      event: 'dlq_processing_started',
      messageCount: event.Records.length,
      requestId: context.awsRequestId,
    })
  );

  for (const record of event.Records) {
    try {
      const result = await processRecord(record);
      results.push(result);
    } catch (error) {
      console.error(
        JSON.stringify({
          event: 'dlq_processing_error',
          messageId: record.messageId,
          error: (error as Error).message,
        })
      );
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  // Log summary
  console.info(
    JSON.stringify({
      event: 'dlq_processing_complete',
      total: event.Records.length,
      retried: results.filter((r) => r.action === 'retried').length,
      discarded: results.filter((r) => r.action === 'discarded').length,
      escalated: results.filter((r) => r.action === 'escalated').length,
      failed: failures.length,
    })
  );

  // Return partial batch failure
  return { batchItemFailures: failures };
}

/**
 * Process a single DLQ record
 */
async function processRecord(record: SQSRecord): Promise<ProcessingResult> {
  const messageId = record.messageId;
  let dlqMessage: DLQMessage;

  try {
    dlqMessage = JSON.parse(record.body);
  } catch {
    // If we can't parse the message, discard it
    return {
      messageId,
      action: 'discarded',
      reason: 'Invalid message format',
    };
  }

  const retryCount = dlqMessage.retryCount || 0;

  // Check if message should be retried
  if (shouldRetry(dlqMessage)) {
    if (retryCount < MAX_RETRY_COUNT) {
      await retryMessage(dlqMessage, retryCount + 1);
      return {
        messageId,
        action: 'retried',
        reason: `Retry attempt ${retryCount + 1}`,
      };
    }
  }

  // Check if message should be escalated
  if (shouldEscalate(dlqMessage)) {
    await escalateMessage(dlqMessage, messageId);
    return {
      messageId,
      action: 'escalated',
      reason: 'Max retries exceeded or critical error',
    };
  }

  // Otherwise, discard the message
  return {
    messageId,
    action: 'discarded',
    reason: 'Non-retryable error',
  };
}

/**
 * Determine if a message should be retried
 */
function shouldRetry(message: DLQMessage): boolean {
  const errorName = message.error?.name;
  const errorMessage = message.error?.message?.toLowerCase() || '';

  // Don't retry validation errors
  if (errorName === 'ValidationError') {
    return false;
  }

  // Don't retry authentication/authorization errors
  if (
    errorName === 'UnauthorizedError' ||
    errorName === 'ForbiddenError' ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden')
  ) {
    return false;
  }

  // Don't retry not found errors
  if (errorName === 'NotFoundError' || errorMessage.includes('not found')) {
    return false;
  }

  // Don't retry bad request errors
  if (errorMessage.includes('bad request') || errorMessage.includes('invalid')) {
    return false;
  }

  // Retry transient errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('service unavailable') ||
    errorMessage.includes('internal error')
  ) {
    return true;
  }

  // Default to retry for unknown errors
  return true;
}

/**
 * Determine if a message should be escalated
 */
function shouldEscalate(message: DLQMessage): boolean {
  const retryCount = message.retryCount || 0;

  // Escalate if max retries exceeded
  if (retryCount >= MAX_RETRY_COUNT) {
    return true;
  }

  const errorName = message.error?.name;

  // Escalate critical errors immediately
  const criticalErrors = [
    'SecurityError',
    'DataCorruptionError',
    'SystemError',
    'FatalError',
  ];

  if (criticalErrors.includes(errorName || '')) {
    return true;
  }

  return false;
}

/**
 * Retry a message by sending it back to the original queue
 */
async function retryMessage(
  message: DLQMessage,
  newRetryCount: number
): Promise<void> {
  const originalMsg = typeof message.originalMessage === 'object' && message.originalMessage !== null
    ? message.originalMessage
    : {};
  const retryMessage = {
    ...originalMsg as Record<string, unknown>,
    _retryCount: newRetryCount,
    _lastError: message.error,
    _retriedAt: new Date().toISOString(),
  };

  // Add delay based on retry count (exponential backoff)
  const delaySeconds = Math.min(300, Math.pow(2, newRetryCount) * 10);

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: message.originalQueueUrl,
      MessageBody: JSON.stringify(retryMessage),
      DelaySeconds: delaySeconds,
    })
  );

  console.info(
    JSON.stringify({
      event: 'message_retried',
      retryCount: newRetryCount,
      delaySeconds,
      originalQueue: message.originalQueueUrl,
    })
  );
}

/**
 * Escalate a message by sending an alert
 */
async function escalateMessage(
  message: DLQMessage,
  messageId: string
): Promise<void> {
  if (!ALERT_TOPIC_ARN) {
    console.warn('No alert topic configured, skipping escalation');
    return;
  }

  const alertMessage = {
    environment: ENVIRONMENT,
    severity: 'HIGH',
    source: 'dlq-processor',
    title: 'DLQ Message Escalation',
    message: `A message in the Dead Letter Queue has exceeded max retries or encountered a critical error.`,
    details: {
      messageId,
      error: message.error,
      retryCount: message.retryCount,
      failedAt: message.failedAt,
      originalQueue: message.originalQueueUrl,
    },
    timestamp: new Date().toISOString(),
  };

  await sns.send(
    new PublishCommand({
      TopicArn: ALERT_TOPIC_ARN,
      Subject: `[${ENVIRONMENT.toUpperCase()}] DLQ Alert - Message Escalation`,
      Message: JSON.stringify(alertMessage, null, 2),
      MessageAttributes: {
        severity: {
          DataType: 'String',
          StringValue: 'HIGH',
        },
        source: {
          DataType: 'String',
          StringValue: 'dlq-processor',
        },
      },
    })
  );

  console.warn(
    JSON.stringify({
      event: 'message_escalated',
      messageId,
      error: message.error?.message,
      retryCount: message.retryCount,
    })
  );
}

/**
 * Create a DLQ message format for failed processing
 */
export function createDLQMessage(
  originalMessage: unknown,
  error: Error,
  originalQueueUrl: string,
  retryCount: number = 0
): DLQMessage {
  return {
    originalMessage,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    failedAt: new Date().toISOString(),
    retryCount,
    originalQueueUrl,
  };
}
