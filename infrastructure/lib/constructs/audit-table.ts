import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';

export interface AuditTableProps {
  tableName: string;
  encryptionKey: kms.IKey;
  ttlAttribute?: string;
}

/** DynamoDB table with encryption, PITR, TTL, and streams */
export class AuditTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: AuditTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Table', {
      tableName: props.tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: props.encryptionKey,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: props.ttlAttribute ?? 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}
