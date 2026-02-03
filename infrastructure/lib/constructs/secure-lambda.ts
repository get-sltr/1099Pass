import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';

export interface SecureLambdaProps {
  functionName: string;
  handler: string;
  codePath: string;
  vpc: ec2.IVpc;
  securityGroups: ec2.ISecurityGroup[];
  encryptionKey: kms.IKey;
  environment?: Record<string, string>;
  memorySize?: number;
  timeout?: cdk.Duration;
  logRetention?: logs.RetentionDays;
}

/** Lambda with VPC, X-Ray, DLQ, log retention, and error alarms */
export class SecureLambda extends Construct {
  public readonly function: lambda.Function;
  public readonly logGroup: logs.LogGroup;
  public readonly errorAlarm: cloudwatch.Alarm;

  constructor(scope: Construct, id: string, props: SecureLambdaProps) {
    super(scope, id);

    const dlq = new sqs.Queue(this, 'DLQ', {
      queueName: `${props.functionName}-dlq`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: props.encryptionKey,
    });

    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${props.functionName}`,
      retention: props.logRetention ?? logs.RetentionDays.THREE_MONTHS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.function = new lambda.Function(this, 'Function', {
      functionName: props.functionName,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: props.handler,
      code: lambda.Code.fromAsset(props.codePath),
      memorySize: props.memorySize ?? 256,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: props.securityGroups,
      environment: props.environment,
      environmentEncryption: props.encryptionKey,
      tracing: lambda.Tracing.ACTIVE,
      deadLetterQueue: dlq,
      logGroup: this.logGroup,
    });

    this.errorAlarm = new cloudwatch.Alarm(this, 'ErrorAlarm', {
      alarmName: `${props.functionName}-errors`,
      metric: this.function.metricErrors({ period: cdk.Duration.minutes(5) }),
      threshold: 5,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
  }
}
