import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as guardduty from 'aws-cdk-lib/aws-guardduty';
import { Construct } from 'constructs';

export interface SecurityStackProps extends cdk.StackProps {
  environment: string;
}

export class SecurityStack extends cdk.Stack {
  public readonly encryptionKey: kms.Key;
  public readonly dbSecret: secretsmanager.Secret;
  public readonly plaidSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props: SecurityStackProps) {
    super(scope, id, props);

    // KMS Customer Managed Key
    this.encryptionKey = new kms.Key(this, 'EncryptionKey', {
      alias: `pass1099-${props.environment}-key`,
      description: '1099Pass data encryption key',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Secrets Manager entries
    this.dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
      secretName: `pass1099-${props.environment}-db-credentials`,
      description: 'RDS PostgreSQL credentials',
      encryptionKey: this.encryptionKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    this.plaidSecret = new secretsmanager.Secret(this, 'PlaidSecret', {
      secretName: `pass1099-${props.environment}-plaid-api-key`,
      description: 'Plaid API credentials',
      encryptionKey: this.encryptionKey,
    });

    new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: `pass1099-${props.environment}-jwt-signing-key`,
      description: 'JWT signing key',
      encryptionKey: this.encryptionKey,
      generateSecretString: { passwordLength: 64, excludePunctuation: true },
    });

    // GuardDuty
    new guardduty.CfnDetector(this, 'GuardDuty', {
      enable: true,
      findingPublishingFrequency: 'FIFTEEN_MINUTES',
    });
  }
}
