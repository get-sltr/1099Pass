import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  environment: string;
  api: apigateway.RestApi;
  lambdaFunctions: lambda.Function[];
  dbInstance: rds.DatabaseInstance;
  alertEmail?: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alertTopic: sns.Topic;
  public readonly criticalAlertTopic: sns.Topic;
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const isProd = props.environment === 'prod';

    // SNS Topics for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `pass1099-${props.environment}-alerts`,
      displayName: '1099Pass Alerts',
    });

    this.criticalAlertTopic = new sns.Topic(this, 'CriticalAlertTopic', {
      topicName: `pass1099-${props.environment}-critical-alerts`,
      displayName: '1099Pass Critical Alerts',
    });

    // Add email subscription if provided
    if (props.alertEmail) {
      this.alertTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(props.alertEmail)
      );
      this.criticalAlertTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(props.alertEmail)
      );
    }

    const alertAction = new cloudwatch_actions.SnsAction(this.alertTopic);
    const criticalAction = new cloudwatch_actions.SnsAction(this.criticalAlertTopic);

    // =========================================================================
    // API GATEWAY ALARMS
    // =========================================================================

    // API 5xx errors (critical)
    new cloudwatch.Alarm(this, 'Api5xxAlarm', {
      alarmName: `pass1099-${props.environment}-api-5xx`,
      alarmDescription: 'API Gateway 5xx errors detected',
      metric: props.api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: isProd ? 1 : 5,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      actionsEnabled: true,
    }).addAlarmAction(criticalAction);

    // API 4xx errors (warning)
    new cloudwatch.Alarm(this, 'Api4xxAlarm', {
      alarmName: `pass1099-${props.environment}-api-4xx`,
      alarmDescription: 'Elevated API Gateway 4xx errors',
      metric: props.api.metricClientError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 50,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // API latency (p95)
    new cloudwatch.Alarm(this, 'ApiLatencyAlarm', {
      alarmName: `pass1099-${props.environment}-api-latency`,
      alarmDescription: 'API Gateway latency exceeded threshold',
      metric: props.api.metricLatency({
        period: cdk.Duration.minutes(5),
        statistic: 'p95',
      }),
      threshold: 3000, // 3 seconds
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // API request count anomaly (traffic spike/drop)
    new cloudwatch.Alarm(this, 'ApiRequestCountAlarm', {
      alarmName: `pass1099-${props.environment}-api-request-drop`,
      alarmDescription: 'API request count dropped significantly',
      metric: props.api.metricCount({
        period: cdk.Duration.minutes(15),
        statistic: 'Sum',
      }),
      threshold: isProd ? 10 : 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    }).addAlarmAction(alertAction);

    // =========================================================================
    // LAMBDA ALARMS
    // =========================================================================

    props.lambdaFunctions.forEach((fn) => {
      // Duration alarm
      new cloudwatch.Alarm(this, `${fn.node.id}DurationAlarm`, {
        alarmName: `${fn.functionName}-duration`,
        alarmDescription: `Lambda ${fn.functionName} duration exceeded threshold`,
        metric: fn.metricDuration({
          period: cdk.Duration.minutes(5),
          statistic: 'p99',
        }),
        threshold: 10000, // 10 seconds
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(alertAction);

      // Error alarm
      new cloudwatch.Alarm(this, `${fn.node.id}ErrorAlarm`, {
        alarmName: `${fn.functionName}-errors`,
        alarmDescription: `Lambda ${fn.functionName} errors detected`,
        metric: fn.metricErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: isProd ? 1 : 3,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(criticalAction);

      // Throttle alarm
      new cloudwatch.Alarm(this, `${fn.node.id}ThrottleAlarm`, {
        alarmName: `${fn.functionName}-throttles`,
        alarmDescription: `Lambda ${fn.functionName} throttling detected`,
        metric: fn.metricThrottles({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 1,
        evaluationPeriods: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(alertAction);

      // Concurrent executions alarm
      new cloudwatch.Alarm(this, `${fn.node.id}ConcurrencyAlarm`, {
        alarmName: `${fn.functionName}-concurrency`,
        alarmDescription: `Lambda ${fn.functionName} high concurrency`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'ConcurrentExecutions',
          dimensionsMap: { FunctionName: fn.functionName },
          period: cdk.Duration.minutes(5),
          statistic: 'Maximum',
        }),
        threshold: 100,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(alertAction);
    });

    // =========================================================================
    // RDS ALARMS
    // =========================================================================

    // CPU utilization
    new cloudwatch.Alarm(this, 'RdsCpuAlarm', {
      alarmName: `pass1099-${props.environment}-rds-cpu`,
      alarmDescription: 'RDS CPU utilization exceeded threshold',
      metric: props.dbInstance.metricCPUUtilization({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // Free storage space
    new cloudwatch.Alarm(this, 'RdsFreeStorageAlarm', {
      alarmName: `pass1099-${props.environment}-rds-storage`,
      alarmDescription: 'RDS free storage space below threshold',
      metric: props.dbInstance.metricFreeStorageSpace({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5 * 1024 * 1024 * 1024, // 5 GB
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(criticalAction);

    // Database connections
    new cloudwatch.Alarm(this, 'RdsConnectionsAlarm', {
      alarmName: `pass1099-${props.environment}-rds-connections`,
      alarmDescription: 'RDS database connections exceeded threshold',
      metric: props.dbInstance.metricDatabaseConnections({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 100,
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // Freeable memory
    new cloudwatch.Alarm(this, 'RdsFreeableMemoryAlarm', {
      alarmName: `pass1099-${props.environment}-rds-memory`,
      alarmDescription: 'RDS freeable memory below threshold',
      metric: props.dbInstance.metricFreeableMemory({
        period: cdk.Duration.minutes(5),
      }),
      threshold: 256 * 1024 * 1024, // 256 MB
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // Read latency
    new cloudwatch.Alarm(this, 'RdsReadLatencyAlarm', {
      alarmName: `pass1099-${props.environment}-rds-read-latency`,
      alarmDescription: 'RDS read latency exceeded threshold',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'ReadLatency',
        dimensionsMap: { DBInstanceIdentifier: props.dbInstance.instanceIdentifier },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 0.1, // 100ms
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // Write latency
    new cloudwatch.Alarm(this, 'RdsWriteLatencyAlarm', {
      alarmName: `pass1099-${props.environment}-rds-write-latency`,
      alarmDescription: 'RDS write latency exceeded threshold',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'WriteLatency',
        dimensionsMap: { DBInstanceIdentifier: props.dbInstance.instanceIdentifier },
        period: cdk.Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 0.1, // 100ms
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // =========================================================================
    // LOG-BASED METRICS & ALARMS
    // =========================================================================

    // Create metric filter for authentication failures
    const authFailureMetric = new logs.MetricFilter(this, 'AuthFailureMetric', {
      logGroup: new logs.LogGroup(this, 'ApiLogGroup', {
        logGroupName: `/aws/apigateway/pass1099-${props.environment}`,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      metricNamespace: `1099Pass/${props.environment}`,
      metricName: 'AuthenticationFailures',
      filterPattern: logs.FilterPattern.literal('UnauthorizedError'),
      metricValue: '1',
    });

    new cloudwatch.Alarm(this, 'AuthFailureAlarm', {
      alarmName: `pass1099-${props.environment}-auth-failures`,
      alarmDescription: 'Elevated authentication failures detected',
      metric: authFailureMetric.metric({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alertAction);

    // =========================================================================
    // COMPREHENSIVE DASHBOARD
    // =========================================================================

    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `pass1099-${props.environment}`,
      defaultInterval: cdk.Duration.hours(3),
    });

    // Header
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: `# 1099Pass Dashboard (${props.environment.toUpperCase()})
Last updated: Dynamic`,
        width: 24,
        height: 1,
      })
    );

    // Alarm status row
    this.dashboard.addWidgets(
      new cloudwatch.AlarmStatusWidget({
        title: 'Alarm Status',
        alarms: [
          cloudwatch.Alarm.fromAlarmName(this, 'Api5xxRef', `pass1099-${props.environment}-api-5xx`),
          cloudwatch.Alarm.fromAlarmName(this, 'RdsCpuRef', `pass1099-${props.environment}-rds-cpu`),
          cloudwatch.Alarm.fromAlarmName(this, 'RdsStorageRef', `pass1099-${props.environment}-rds-storage`),
        ],
        width: 24,
        height: 2,
      })
    );

    // API Gateway row
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '## API Gateway',
        width: 24,
        height: 1,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Requests',
        left: [
          props.api.metricCount({
            period: cdk.Duration.minutes(1),
            statistic: 'Sum',
          }),
        ],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Latency (p50, p95, p99)',
        left: [
          props.api.metricLatency({
            period: cdk.Duration.minutes(1),
            statistic: 'p50',
            label: 'p50',
          }),
          props.api.metricLatency({
            period: cdk.Duration.minutes(1),
            statistic: 'p95',
            label: 'p95',
          }),
          props.api.metricLatency({
            period: cdk.Duration.minutes(1),
            statistic: 'p99',
            label: 'p99',
          }),
        ],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Errors (4xx/5xx)',
        left: [
          props.api.metricClientError({
            period: cdk.Duration.minutes(1),
            statistic: 'Sum',
            label: '4xx',
            color: '#ff7f0e',
          }),
          props.api.metricServerError({
            period: cdk.Duration.minutes(1),
            statistic: 'Sum',
            label: '5xx',
            color: '#d62728',
          }),
        ],
        width: 8,
        height: 6,
      })
    );

    // Lambda row
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '## Lambda Functions',
        width: 24,
        height: 1,
      })
    );

    const lambdaMetrics = props.lambdaFunctions.slice(0, 4).map((fn) => ({
      invocations: fn.metricInvocations({
        period: cdk.Duration.minutes(1),
        statistic: 'Sum',
        label: fn.functionName.replace(`pass1099-${props.environment}-`, ''),
      }),
      duration: fn.metricDuration({
        period: cdk.Duration.minutes(1),
        statistic: 'Average',
        label: fn.functionName.replace(`pass1099-${props.environment}-`, ''),
      }),
      errors: fn.metricErrors({
        period: cdk.Duration.minutes(1),
        statistic: 'Sum',
        label: fn.functionName.replace(`pass1099-${props.environment}-`, ''),
      }),
    }));

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda Invocations',
        left: lambdaMetrics.map((m) => m.invocations),
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda Duration (avg)',
        left: lambdaMetrics.map((m) => m.duration),
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda Errors',
        left: lambdaMetrics.map((m) => m.errors),
        width: 8,
        height: 6,
      })
    );

    // RDS row
    this.dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '## RDS Database',
        width: 24,
        height: 1,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'RDS CPU Utilization',
        left: [
          props.dbInstance.metricCPUUtilization({
            period: cdk.Duration.minutes(1),
          }),
        ],
        leftAnnotations: [
          { value: 80, label: 'Warning', color: '#ff7f0e' },
        ],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'RDS Connections',
        left: [
          props.dbInstance.metricDatabaseConnections({
            period: cdk.Duration.minutes(1),
          }),
        ],
        leftAnnotations: [
          { value: 100, label: 'Warning', color: '#ff7f0e' },
        ],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'RDS Free Storage (GB)',
        left: [
          new cloudwatch.MathExpression({
            expression: 'm1 / 1024 / 1024 / 1024',
            usingMetrics: {
              m1: props.dbInstance.metricFreeStorageSpace({
                period: cdk.Duration.minutes(5),
              }),
            },
            label: 'Free Storage (GB)',
          }),
        ],
        leftAnnotations: [
          { value: 5, label: 'Critical', color: '#d62728' },
        ],
        width: 8,
        height: 6,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'RDS Read/Write IOPS',
        left: [
          props.dbInstance.metricReadIOPS({
            period: cdk.Duration.minutes(1),
            label: 'Read IOPS',
          }),
          props.dbInstance.metricWriteIOPS({
            period: cdk.Duration.minutes(1),
            label: 'Write IOPS',
          }),
        ],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'RDS Latency',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/RDS',
            metricName: 'ReadLatency',
            dimensionsMap: { DBInstanceIdentifier: props.dbInstance.instanceIdentifier },
            period: cdk.Duration.minutes(1),
            statistic: 'Average',
            label: 'Read Latency',
          }),
          new cloudwatch.Metric({
            namespace: 'AWS/RDS',
            metricName: 'WriteLatency',
            dimensionsMap: { DBInstanceIdentifier: props.dbInstance.instanceIdentifier },
            period: cdk.Duration.minutes(1),
            statistic: 'Average',
            label: 'Write Latency',
          }),
        ],
        leftAnnotations: [
          { value: 0.1, label: 'Warning (100ms)', color: '#ff7f0e' },
        ],
        width: 12,
        height: 6,
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS topic ARN for alerts',
    });

    new cdk.CfnOutput(this, 'CriticalAlertTopicArn', {
      value: this.criticalAlertTopic.topicArn,
      description: 'SNS topic ARN for critical alerts',
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });
  }
}
