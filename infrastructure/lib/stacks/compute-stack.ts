import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import * as path from 'path';

export interface ComputeStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.IVpc;
  lambdaSg: ec2.ISecurityGroup;
  dbSecret: secretsmanager.ISecret;
  encryptionKey: kms.IKey;
  documentsBucket: s3.IBucket;
  reportsBucket: s3.IBucket;
  api: apigateway.RestApi;
  authorizer: apigateway.CognitoUserPoolsAuthorizer;
  /** Cognito User Pool ID (for login Lambda) */
  userPoolId: string;
  /** Cognito app client IDs (for login Lambda) */
  cognitoBorrowerClientId: string;
  cognitoLenderClientId: string;
}

export class ComputeStack extends cdk.Stack {
  public readonly lambdaFunctions: lambda.Function[] = [];

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const commonEnv: Record<string, string> = {
      ENVIRONMENT: props.environment,
      DB_SECRET_ARN: props.dbSecret.secretArn,
      DOCUMENTS_BUCKET: props.documentsBucket.bucketName,
      REPORTS_BUCKET: props.reportsBucket.bucketName,
      KMS_KEY_ID: props.encryptionKey.keyId,
    };

    // Define API resources
    const authResource = props.api.root.addResource('auth');
    const borrowersResource = props.api.root.addResource('borrowers');
    props.api.root.addResource('financial');
    props.api.root.addResource('documents');
    const reportsResource = props.api.root.addResource('reports');
    props.api.root.addResource('lenders');
    props.api.root.addResource('messages');
    const aiResource = props.api.root.addResource('ai');

    // Resolve API handlers path (repo root = 1099Pass/1099Pass; from lib/stacks use 3 levels up)
    const apiHandlersRoot = path.join(__dirname, '..', '..', '..', 'packages', 'api', 'src', 'handlers');

    const nodejsDefaults: Partial<lambdaNodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.lambdaSg],
      environment: commonEnv,
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: true,
        forceDockerBundling: false,
      },
    };

    const methodOptions: apigateway.MethodOptions = {
      authorizer: props.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Health check (public, no auth)
    const healthFn = new lambdaNodejs.NodejsFunction(this, 'HealthFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-health`,
      entry: path.join(apiHandlersRoot, 'health', 'index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(5),
    });
    props.api.root.addResource('health').addMethod('GET', new apigateway.LambdaIntegration(healthFn));
    this.lambdaFunctions.push(healthFn);

    // Rates (public, no auth) — read from rate_cache only. Updated by refresh Lambda (Thursdays).
    const fredApiKeySecret = new secretsmanager.Secret(this, 'FredApiKeySecret', {
      secretName: `pass1099-${props.environment}-fred-api-key`,
      description: 'FRED API key for live mortgage rates (MORTGAGE30US, MORTGAGE15US). Set the secret value in AWS Console.',
      encryptionKey: props.encryptionKey,
    });
    const ratesFn = new lambdaNodejs.NodejsFunction(this, 'RatesFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-rates`,
      entry: path.join(apiHandlersRoot, 'rates', 'index.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(10),
      environment: commonEnv,
    });
    props.api.root.addResource('rates').addMethod('GET', new apigateway.LambdaIntegration(ratesFn));
    this.lambdaFunctions.push(ratesFn);

    // Scheduled: refresh rate_cache from FRED every Thursday 1:00 PM ET (after 12 PM ET release). Stays under 30 req/min.
    const refreshRatesFn = new lambdaNodejs.NodejsFunction(this, 'RefreshRatesFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-rates-refresh`,
      entry: path.join(apiHandlersRoot, 'rates', 'refresh.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      environment: {
        ...commonEnv,
        FRED_SECRET_ARN: fredApiKeySecret.secretArn,
      },
    });
    fredApiKeySecret.grantRead(refreshRatesFn);
    this.lambdaFunctions.push(refreshRatesFn);

    const rateRefreshRule = new events.Rule(this, 'RateRefreshSchedule', {
      schedule: events.Schedule.cron({ minute: '0', hour: '18', weekDay: 'THU', month: '*', year: '*' }),
      description: 'Fetch FRED rates every Thursday 1:00 PM ET (18:00 UTC) and write to rate_cache',
    });
    rateRefreshRule.addTarget(new targets.LambdaFunction(refreshRatesFn));

    // Auth handlers
    const registerFn = new lambdaNodejs.NodejsFunction(this, 'RegisterFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-auth-register`,
      entry: path.join(apiHandlersRoot, 'auth', 'register.ts'),
      handler: 'handler',
    });
    authResource.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerFn));
    this.lambdaFunctions.push(registerFn);

    const loginFn = new lambdaNodejs.NodejsFunction(this, 'LoginFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-auth-login`,
      entry: path.join(apiHandlersRoot, 'auth', 'login.ts'),
      handler: 'handler',
      environment: {
        ...commonEnv,
        USER_POOL_ID: props.userPoolId,
        COGNITO_BORROWER_CLIENT_ID: props.cognitoBorrowerClientId,
        COGNITO_LENDER_CLIENT_ID: props.cognitoLenderClientId,
      },
    });
    authResource.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginFn));
    this.lambdaFunctions.push(loginFn);

    // Borrower handlers
    const getProfileFn = new lambdaNodejs.NodejsFunction(this, 'GetProfileFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-borrower-get-profile`,
      entry: path.join(apiHandlersRoot, 'borrower', 'get-profile.ts'),
      handler: 'handler',
    });
    borrowersResource.addResource('me').addMethod('GET', new apigateway.LambdaIntegration(getProfileFn), methodOptions);
    this.lambdaFunctions.push(getProfileFn);

    // Reports handlers
    const generateReportFn = new lambdaNodejs.NodejsFunction(this, 'GenerateReportFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-reports-generate`,
      entry: path.join(apiHandlersRoot, 'reports', 'generate.ts'),
      handler: 'handler',
    });
    reportsResource.addMethod('POST', new apigateway.LambdaIntegration(generateReportFn), methodOptions);
    this.lambdaFunctions.push(generateReportFn);

    const listReportsFn = new lambdaNodejs.NodejsFunction(this, 'ListReportsFn', {
      ...nodejsDefaults,
      functionName: `pass1099-${props.environment}-reports-list`,
      entry: path.join(apiHandlersRoot, 'reports', 'list.ts'),
      handler: 'handler',
    });
    reportsResource.addMethod('GET', new apigateway.LambdaIntegration(listReportsFn), methodOptions);
    this.lambdaFunctions.push(listReportsFn);

    // AI handlers (Bedrock) — 512MB, 60s timeout
    const aiLambdaProps = {
      ...nodejsDefaults,
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
    };
    const chatFn = new lambdaNodejs.NodejsFunction(this, 'AiChatFn', {
      ...aiLambdaProps,
      functionName: `pass1099-${props.environment}-ai-chat`,
      entry: path.join(apiHandlersRoot, 'ai', 'chat.ts'),
      handler: 'handler',
    });
    aiResource.addResource('chat').addMethod('POST', new apigateway.LambdaIntegration(chatFn), methodOptions);
    this.lambdaFunctions.push(chatFn);

    const analyzeDocumentFn = new lambdaNodejs.NodejsFunction(this, 'AiAnalyzeDocumentFn', {
      ...aiLambdaProps,
      functionName: `pass1099-${props.environment}-ai-analyze-document`,
      entry: path.join(apiHandlersRoot, 'ai', 'analyze-document.ts'),
      handler: 'handler',
    });
    aiResource.addResource('analyze-document').addMethod('POST', new apigateway.LambdaIntegration(analyzeDocumentFn), methodOptions);
    this.lambdaFunctions.push(analyzeDocumentFn);

    // Grant permissions via IAM policies (avoids cross-stack key policy dependencies)
    const allFunctions = [
      healthFn,
      ratesFn,
      refreshRatesFn,
      registerFn,
      loginFn,
      getProfileFn,
      generateReportFn,
      listReportsFn,
      chatFn,
      analyzeDocumentFn,
    ];

    // Grant secrets manager and KMS access via IAM
    allFunctions.forEach(fn => {
      fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [props.dbSecret.secretArn],
      }));
      fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['kms:Decrypt'],
        resources: [props.encryptionKey.keyArn],
      }));
    });

    // Bedrock permissions for AI Lambdas
    [chatFn, analyzeDocumentFn].forEach(fn => {
      fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
        resources: [
          'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-haiku-*',
          'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-*',
        ],
      }));
    });

    props.documentsBucket.grantReadWrite(generateReportFn);
    props.reportsBucket.grantReadWrite(generateReportFn);
    props.reportsBucket.grantRead(listReportsFn);

    // Additional KMS permissions for report generation
    generateReportFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['kms:Encrypt', 'kms:GenerateDataKey*'],
      resources: [props.encryptionKey.keyArn],
    }));
  }
}
