import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface NetworkingStackProps extends cdk.StackProps {
  environment: string;
  isProd: boolean;
}

export class NetworkingStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly lambdaSg: ec2.SecurityGroup;
  public readonly rdsSg: ec2.SecurityGroup;
  public readonly cacheSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: NetworkingStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: `1099pass-${props.environment}-vpc`,
      maxAzs: 2,
      natGateways: props.isProd ? 2 : 1,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'Isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    // Security Groups
    this.lambdaSg = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc: this.vpc,
      securityGroupName: `1099pass-${props.environment}-lambda-sg`,
      description: 'Security group for Lambda functions',
    });

    this.rdsSg = new ec2.SecurityGroup(this, 'RdsSG', {
      vpc: this.vpc,
      securityGroupName: `1099pass-${props.environment}-rds-sg`,
      description: 'Security group for RDS PostgreSQL',
    });
    this.rdsSg.addIngressRule(this.lambdaSg, ec2.Port.tcp(5432), 'Allow Lambda to RDS');

    this.cacheSg = new ec2.SecurityGroup(this, 'CacheSG', {
      vpc: this.vpc,
      securityGroupName: `1099pass-${props.environment}-cache-sg`,
      description: 'Security group for ElastiCache',
    });
    this.cacheSg.addIngressRule(this.lambdaSg, ec2.Port.tcp(6379), 'Allow Lambda to ElastiCache');

    // VPC Endpoints
    this.vpc.addGatewayEndpoint('S3Endpoint', { service: ec2.GatewayVpcEndpointAwsService.S3 });
    this.vpc.addGatewayEndpoint('DynamoEndpoint', { service: ec2.GatewayVpcEndpointAwsService.DYNAMODB });
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', { service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER });
    this.vpc.addInterfaceEndpoint('KmsEndpoint', { service: ec2.InterfaceVpcEndpointAwsService.KMS });
  }
}
