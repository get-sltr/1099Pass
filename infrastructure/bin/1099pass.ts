#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkingStack } from '../lib/stacks/networking-stack';
import { SecurityStack } from '../lib/stacks/security-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') as string || 'dev';
const isProd = environment === 'prod';

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

const tags = {
  Project: '1099Pass',
  Environment: environment,
  ManagedBy: 'CDK',
  Owner: 'SLTR Digital LLC',
};

const networking = new NetworkingStack(app, `1099Pass-Networking-${environment}`, {
  env,
  tags,
  environment,
  isProd,
});

const security = new SecurityStack(app, `1099Pass-Security-${environment}`, {
  env,
  tags,
  environment,
});

const database = new DatabaseStack(app, `1099Pass-Database-${environment}`, {
  env,
  tags,
  environment,
  isProd,
  vpc: networking.vpc,
  rdsSg: networking.rdsSg,
  encryptionKey: security.encryptionKey,
});

const storage = new StorageStack(app, `1099Pass-Storage-${environment}`, {
  env,
  tags,
  environment,
  encryptionKey: security.encryptionKey,
});

const auth = new AuthStack(app, `1099Pass-Auth-${environment}`, {
  env,
  tags,
  environment,
});

const api = new ApiStack(app, `1099Pass-Api-${environment}`, {
  env,
  tags,
  environment,
  userPool: auth.userPool,
});

const compute = new ComputeStack(app, `1099Pass-Compute-${environment}`, {
  env,
  tags,
  environment,
  vpc: networking.vpc,
  lambdaSg: networking.lambdaSg,
  dbSecret: database.dbSecret,
  encryptionKey: security.encryptionKey,
  documentsBucket: storage.documentsBucket,
  reportsBucket: storage.reportsBucket,
  api: api.api,
  authorizer: api.authorizer,
});

new MonitoringStack(app, `1099Pass-Monitoring-${environment}`, {
  env,
  tags,
  environment,
  api: api.api,
  lambdaFunctions: compute.lambdaFunctions,
  dbInstance: database.dbInstance,
});

app.synth();
