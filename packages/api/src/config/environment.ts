/** Get environment variable or throw */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/** Application configuration */
export const config = {
  get environment() { return getEnvVar('ENVIRONMENT'); },
  get dbSecretArn() { return getEnvVar('DB_SECRET_ARN'); },
  get documentsBucket() { return getEnvVar('DOCUMENTS_BUCKET'); },
  get reportsBucket() { return getEnvVar('REPORTS_BUCKET'); },
  get kmsKeyId() { return getEnvVar('KMS_KEY_ID'); },
  get userPoolId() { return process.env.USER_POOL_ID ?? ''; },
  get cognitoClientId() { return process.env.COGNITO_CLIENT_ID ?? ''; },
  get snsTopicArn() { return process.env.SNS_TOPIC_ARN ?? ''; },
  get sessionsTable() { return process.env.SESSIONS_TABLE ?? ''; },
  get notificationsTable() { return process.env.NOTIFICATIONS_TABLE ?? ''; },
  isDev: () => process.env.ENVIRONMENT === 'dev',
};
