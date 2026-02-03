import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  environment: string;
  api: apigateway.RestApi;
  lambdaFunctions: lambda.Function[];
  dbInstance: rds.DatabaseInstance;
}

export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `1099pass-${props.environment}-alerts`,
      displayName: '1099Pass Alerts',
    });

    // API 5xx errors alarm
    const api5xxAlarm = new cloudwatch.Alarm(this, 'Api5xxAlarm', {
      alarmName: `1099pass-${props.environment}-api-5xx`,
      metric: props.api.metricServerError({ period: cdk.Duration.minutes(5) }),
      threshold: 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    api5xxAlarm.addAlarmAction({ bind: () => ({ alarmActionArn: alertTopic.topicArn }) });

    // Lambda duration alarms
    props.lambdaFunctions.forEach((fn) => {
      const alarm = new cloudwatch.Alarm(this, `${fn.node.id}DurationAlarm`, {
        alarmName: `${fn.functionName}-duration`,
        metric: fn.metricDuration({ period: cdk.Duration.minutes(5), statistic: 'p99' }),
        threshold: 10000, // 10 seconds
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
      alarm.addAlarmAction({ bind: () => ({ alarmActionArn: alertTopic.topicArn }) });
    });

    // RDS CPU alarm
    const rdsCpuAlarm = new cloudwatch.Alarm(this, 'RdsCpuAlarm', {
      alarmName: `1099pass-${props.environment}-rds-cpu`,
      metric: props.dbInstance.metricCPUUtilization({ period: cdk.Duration.minutes(5) }),
      threshold: 80,
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    rdsCpuAlarm.addAlarmAction({ bind: () => ({ alarmActionArn: alertTopic.topicArn }) });

    // RDS free storage alarm
    const rdsFreeStorageAlarm = new cloudwatch.Alarm(this, 'RdsFreeStorageAlarm', {
      alarmName: `1099pass-${props.environment}-rds-storage`,
      metric: props.dbInstance.metricFreeStorageSpace({ period: cdk.Duration.minutes(5) }),
      threshold: 5 * 1024 * 1024 * 1024, // 5 GB
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    rdsFreeStorageAlarm.addAlarmAction({ bind: () => ({ alarmActionArn: alertTopic.topicArn }) });

    // Dashboard
    new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `1099pass-${props.environment}`,
      widgets: [
        [
          new cloudwatch.TextWidget({ markdown: '# 1099Pass Dashboard', width: 24, height: 1 }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: 'API Requests',
            left: [props.api.metricCount({ period: cdk.Duration.minutes(1) })],
            width: 12,
          }),
          new cloudwatch.GraphWidget({
            title: 'API Latency',
            left: [props.api.metricLatency({ period: cdk.Duration.minutes(1) })],
            width: 12,
          }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: 'RDS CPU',
            left: [props.dbInstance.metricCPUUtilization({ period: cdk.Duration.minutes(1) })],
            width: 12,
          }),
          new cloudwatch.GraphWidget({
            title: 'RDS Connections',
            left: [props.dbInstance.metricDatabaseConnections({ period: cdk.Duration.minutes(1) })],
            width: 12,
          }),
        ],
      ],
    });
  }
}
