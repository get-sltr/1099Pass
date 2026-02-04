import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  environment: string;
  userPool: cognito.IUserPool;
}

/**
 * Get allowed CORS origins based on environment
 */
function getAllowedOrigins(environment: string): string[] {
  switch (environment) {
    case 'prod':
      return [
        'https://1099pass.com',
        'https://www.1099pass.com',
        'https://lender.1099pass.com',
        'https://app.1099pass.com',
      ];
    case 'staging':
      return [
        'https://staging.1099pass.com',
        'https://lender.staging.1099pass.com',
        'https://app.staging.1099pass.com',
      ];
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'https://dev.1099pass.com',
      ];
  }
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly authorizer: apigateway.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const allowedOrigins = getAllowedOrigins(props.environment);

    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `pass1099-${props.environment}-api`,
      description: '1099Pass API',
      deployOptions: {
        stageName: props.environment,
        tracingEnabled: true,
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Request-Id',
          'X-Correlation-Id',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.hours(24),
      },
    });

    this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [props.userPool],
      authorizerName: 'pass1099-cognito-authorizer',
    });

    // WAF WebACL
    const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      name: `pass1099-${props.environment}-waf`,
      scope: 'REGIONAL',
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `pass1099-${props.environment}-waf`,
        sampledRequestsEnabled: true,
      },
      rules: [
        // Rate limiting: 1000 requests per IP per 5 minutes
        {
          name: 'RateLimitPerIP',
          priority: 1,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 1000,
              aggregateKeyType: 'IP',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'RateLimitPerIP',
            sampledRequestsEnabled: true,
          },
        },
        // Block requests from known bad IPs
        {
          name: 'AWSManagedRulesAmazonIpReputationList',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesAmazonIpReputationList',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'IpReputationRules',
            sampledRequestsEnabled: true,
          },
        },
        // Common web exploits (OWASP Top 10)
        {
          name: 'AWSManagedRulesCommonRuleSet',
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRules',
            sampledRequestsEnabled: true,
          },
        },
        // SQL injection protection
        {
          name: 'AWSManagedRulesSQLiRuleSet',
          priority: 4,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLiRules',
            sampledRequestsEnabled: true,
          },
        },
        // Known bad inputs (XSS, path traversal, etc.)
        {
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          priority: 5,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'KnownBadInputsRules',
            sampledRequestsEnabled: true,
          },
        },
        // Block requests larger than 8KB body
        {
          name: 'SizeRestrictionRule',
          priority: 6,
          action: { block: {} },
          statement: {
            sizeConstraintStatement: {
              fieldToMatch: { body: { oversizeHandling: 'MATCH' } },
              comparisonOperator: 'GT',
              size: 8192,
              textTransformations: [{ priority: 0, type: 'NONE' }],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'SizeRestriction',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
      webAclArn: webAcl.attrArn,
      resourceArn: this.api.deploymentStage.stageArn,
    });

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.url });
  }
}
