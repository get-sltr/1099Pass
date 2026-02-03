import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

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

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.lambdaSg],
      environment: commonEnv,
      tracing: lambda.Tracing.ACTIVE,
    };

    // Define API resources
    const authResource = props.api.root.addResource('auth');
    const borrowersResource = props.api.root.addResource('borrowers');
    props.api.root.addResource('financial');
    props.api.root.addResource('documents');
    const reportsResource = props.api.root.addResource('reports');
    props.api.root.addResource('lenders');
    props.api.root.addResource('messages');

    const methodOptions: apigateway.MethodOptions = {
      authorizer: props.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Auth handlers
    const registerFn = new lambda.Function(this, 'RegisterFn', {
      ...lambdaProps,
      functionName: `1099pass-${props.environment}-auth-register`,
      handler: 'register.handler',
      code: lambda.Code.fromAsset('../packages/api/dist/handlers/auth'),
    });
    authResource.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(registerFn));
    this.lambdaFunctions.push(registerFn);

    const loginFn = new lambda.Function(this, 'LoginFn', {
      ...lambdaProps,
      functionName: `1099pass-${props.environment}-auth-login`,
      handler: 'login.handler',
      code: lambda.Code.fromAsset('../packages/api/dist/handlers/auth'),
    });
    authResource.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(loginFn));
    this.lambdaFunctions.push(loginFn);

    // Borrower handlers
    const getProfileFn = new lambda.Function(this, 'GetProfileFn', {
      ...lambdaProps,
      functionName: `1099pass-${props.environment}-borrower-get-profile`,
      handler: 'get-profile.handler',
      code: lambda.Code.fromAsset('../packages/api/dist/handlers/borrower'),
    });
    borrowersResource.addResource('me').addMethod('GET', new apigateway.LambdaIntegration(getProfileFn), methodOptions);
    this.lambdaFunctions.push(getProfileFn);

    // Reports handlers
    const generateReportFn = new lambda.Function(this, 'GenerateReportFn', {
      ...lambdaProps,
      functionName: `1099pass-${props.environment}-reports-generate`,
      handler: 'generate-report.handler',
      code: lambda.Code.fromAsset('../packages/api/dist/handlers/reports'),
    });
    reportsResource.addMethod('POST', new apigateway.LambdaIntegration(generateReportFn), methodOptions);
    this.lambdaFunctions.push(generateReportFn);

    const listReportsFn = new lambda.Function(this, 'ListReportsFn', {
      ...lambdaProps,
      functionName: `1099pass-${props.environment}-reports-list`,
      handler: 'list-reports.handler',
      code: lambda.Code.fromAsset('../packages/api/dist/handlers/reports'),
    });
    reportsResource.addMethod('GET', new apigateway.LambdaIntegration(listReportsFn), methodOptions);
    this.lambdaFunctions.push(listReportsFn);

    // Grant permissions
    props.dbSecret.grantRead(registerFn);
    props.dbSecret.grantRead(loginFn);
    props.dbSecret.grantRead(getProfileFn);
    props.dbSecret.grantRead(generateReportFn);
    props.dbSecret.grantRead(listReportsFn);
    props.documentsBucket.grantReadWrite(generateReportFn);
    props.reportsBucket.grantReadWrite(generateReportFn);
    props.encryptionKey.grantEncryptDecrypt(generateReportFn);
  }
}
