import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  environment: string;
  isProd: boolean;
  vpc: ec2.IVpc;
  rdsSg: ec2.ISecurityGroup;
  encryptionKey: kms.IKey;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly dbSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbSecret = new secretsmanager.Secret(this, 'DbCredentials', {
      secretName: `1099pass-${props.environment}-db-credentials`,
      encryptionKey: props.encryptionKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'app_user' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });
    this.dbSecret = dbSecret;

    this.dbInstance = new rds.DatabaseInstance(this, 'PostgreSQL', {
      instanceIdentifier: `1099pass-${props.environment}-db`,
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_15 }),
      instanceType: props.isProd
        ? ec2.InstanceType.of(ec2.InstanceClass.R6G, ec2.InstanceSize.LARGE)
        : ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [props.rdsSg],
      credentials: rds.Credentials.fromSecret(dbSecret),
      databaseName: 'pass1099',
      multiAz: props.isProd,
      storageEncrypted: true,
      storageEncryptionKey: props.encryptionKey,
      backupRetention: cdk.Duration.days(7),
      deletionProtection: props.isProd,
      removalPolicy: props.isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      allocatedStorage: 20,
      maxAllocatedStorage: props.isProd ? 100 : 50,
    });

    // DynamoDB Tables
    new dynamodb.Table(this, 'SessionsTable', {
      tableName: `1099pass-${props.environment}-sessions`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const connectionsTable = new dynamodb.Table(this, 'WebSocketConnectionsTable', {
      tableName: `1099pass-${props.environment}-ws-connections`,
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    connectionsTable.addGlobalSecondaryIndex({
      indexName: 'userId-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    const notificationsTable = new dynamodb.Table(this, 'NotificationsTable', {
      tableName: `1099pass-${props.environment}-notifications`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'notificationId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    notificationsTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'status', type: dynamodb.AttributeType.STRING },
    });
  }
}
