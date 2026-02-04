import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface CicdStackProps extends cdk.StackProps {
  environment: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  alertEmail?: string;
}

export class CicdStack extends cdk.Stack {
  public readonly pipeline: codepipeline.Pipeline;
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: CicdStackProps) {
    super(scope, id, props);

    // Artifact bucket
    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      bucketName: `pass1099-${props.environment}-artifacts`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        { expiration: cdk.Duration.days(30) },
      ],
    });

    // Alert topic for build notifications
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `pass1099-${props.environment}-cicd-alerts`,
      displayName: `1099Pass CI/CD Alerts (${props.environment})`,
    });

    if (props.alertEmail) {
      this.alertTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(props.alertEmail)
      );
    }

    // CodeBuild project for tests
    const testProject = new codebuild.PipelineProject(this, 'TestProject', {
      projectName: `pass1099-${props.environment}-test`,
      description: 'Run tests and type checks',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.MEDIUM,
        privileged: true,
      },
      environmentVariables: {
        ENVIRONMENT: { value: props.environment },
        NODE_ENV: { value: 'test' },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 20 },
            commands: [
              'npm install -g pnpm@8',
              'pnpm install --frozen-lockfile',
            ],
          },
          build: {
            commands: [
              'pnpm run typecheck',
              'pnpm run lint',
              'pnpm run test:ci',
            ],
          },
        },
        reports: {
          'test-reports': {
            files: ['junit.xml', 'coverage/clover.xml'],
            'file-format': 'JUNITXML',
          },
        },
        cache: {
          paths: ['node_modules/**/*', '.pnpm-store/**/*'],
        },
      }),
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.SOURCE),
      timeout: cdk.Duration.minutes(30),
    });

    // CodeBuild project for build
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      projectName: `pass1099-${props.environment}-build`,
      description: 'Build all applications',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.LARGE,
        privileged: true,
      },
      environmentVariables: {
        ENVIRONMENT: { value: props.environment },
        NODE_ENV: { value: 'production' },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 20 },
            commands: [
              'npm install -g pnpm@8',
              'pnpm install --frozen-lockfile',
            ],
          },
          build: {
            commands: [
              'pnpm --filter @1099pass/shared build',
              'pnpm --filter @1099pass/api build',
              'pnpm --filter @1099pass/lender-portal build',
            ],
          },
        },
        artifacts: {
          'secondary-artifacts': {
            'lender-portal': {
              'base-directory': 'apps/lender-portal/.next/standalone',
              files: ['**/*'],
            },
            'api': {
              'base-directory': 'packages/api/dist',
              files: ['**/*'],
            },
          },
        },
        cache: {
          paths: [
            'node_modules/**/*',
            '.pnpm-store/**/*',
            'apps/lender-portal/.next/cache/**/*',
          ],
        },
      }),
      cache: codebuild.Cache.local(
        codebuild.LocalCacheMode.SOURCE,
        codebuild.LocalCacheMode.DOCKER_LAYER
      ),
      timeout: cdk.Duration.minutes(45),
    });

    // CodeBuild project for CDK deploy
    const deployProject = new codebuild.PipelineProject(this, 'DeployProject', {
      projectName: `pass1099-${props.environment}-deploy`,
      description: 'Deploy infrastructure with CDK',
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.MEDIUM,
        privileged: true,
      },
      environmentVariables: {
        ENVIRONMENT: { value: props.environment },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 20 },
            commands: [
              'npm install -g pnpm@8 aws-cdk',
              'pnpm install --frozen-lockfile',
            ],
          },
          build: {
            commands: [
              'cd infrastructure',
              'cdk deploy --all --require-approval never --outputs-file cdk-outputs.json',
            ],
          },
        },
        artifacts: {
          files: ['infrastructure/cdk-outputs.json'],
        },
      }),
      timeout: cdk.Duration.minutes(60),
    });

    // Grant CDK deploy permissions
    deployProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
      })
    );

    // Pipeline artifacts
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const testOutput = new codepipeline.Artifact('TestOutput');
    const buildOutput = new codepipeline.Artifact('BuildOutput');

    // Create the pipeline
    this.pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: `pass1099-${props.environment}`,
      artifactBucket,
      pipelineType: codepipeline.PipelineType.V2,
      restartExecutionOnUpdate: true,
      stages: [
        // Source stage
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: 'GitHub',
              owner: props.githubOwner,
              repo: props.githubRepo,
              branch: props.githubBranch,
              output: sourceOutput,
              connectionArn: `arn:aws:codestar-connections:${this.region}:${this.account}:connection/github-connection`,
              triggerOnPush: true,
            }),
          ],
        },
        // Test stage
        {
          stageName: 'Test',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'RunTests',
              project: testProject,
              input: sourceOutput,
              outputs: [testOutput],
            }),
          ],
        },
        // Build stage
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'BuildApps',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        // Deploy stage (with approval for staging/prod)
        ...(props.environment !== 'dev'
          ? [
              {
                stageName: 'Approval',
                actions: [
                  new codepipeline_actions.ManualApprovalAction({
                    actionName: 'ApproveDeployment',
                    notificationTopic: this.alertTopic,
                    additionalInformation: `Deploy to ${props.environment}?`,
                    externalEntityLink: `https://github.com/${props.githubOwner}/${props.githubRepo}`,
                  }),
                ],
              },
            ]
          : []),
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'DeployCDK',
              project: deployProject,
              input: sourceOutput,
            }),
          ],
        },
      ],
    });

    // Pipeline notifications
    this.pipeline.notifyOnExecutionStateChange(
      'PipelineStateChange',
      this.alertTopic,
      {
        notificationRuleName: `pass1099-${props.environment}-pipeline-state`,
      }
    );

    // Outputs
    new cdk.CfnOutput(this, 'PipelineName', {
      value: this.pipeline.pipelineName,
      description: 'CodePipeline name',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: this.alertTopic.topicArn,
      description: 'SNS topic for pipeline alerts',
    });
  }
}
