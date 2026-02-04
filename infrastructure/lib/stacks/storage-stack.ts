import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { EncryptedBucket } from '../constructs/encrypted-bucket';

export interface StorageStackProps extends cdk.StackProps {
  environment: string;
  encryptionKey: kms.IKey;
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
        'https://api.1099pass.com',
      ];
    case 'staging':
      return [
        'https://staging.1099pass.com',
        'https://lender.staging.1099pass.com',
        'https://app.staging.1099pass.com',
        'https://api.staging.1099pass.com',
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

export class StorageStack extends cdk.Stack {
  public readonly documentsBucket: s3.IBucket;
  public readonly reportsBucket: s3.IBucket;
  public readonly portalDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const allowedOrigins = getAllowedOrigins(props.environment);

    // Documents bucket with environment-specific CORS
    const documents = new EncryptedBucket(this, 'DocumentsBucket', {
      encryptionKey: props.encryptionKey,
      versioned: true,
      lifecycleRules: [
        { id: 'ia-90', transitions: [{ storageClass: s3.StorageClass.INTELLIGENT_TIERING, transitionAfter: cdk.Duration.days(90) }] },
        { id: 'glacier-365', transitions: [{ storageClass: s3.StorageClass.GLACIER, transitionAfter: cdk.Duration.days(365) }] },
      ],
      corsRules: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: allowedOrigins,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
        exposedHeaders: ['ETag', 'Content-Length'],
        maxAge: 3600,
      }],
    });
    this.documentsBucket = documents.bucket;

    // Reports bucket
    const reports = new EncryptedBucket(this, 'ReportsBucket', {
      encryptionKey: props.encryptionKey,
      versioned: true,
      lifecycleRules: [
        { id: 'expire-180', expiration: cdk.Duration.days(180) },
      ],
    });
    this.reportsBucket = reports.bucket;

    // Lender portal bucket
    const portalBucket = new s3.Bucket(this, 'PortalBucket', {
      bucketName: `pass1099-${props.environment}-lender-portal`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution
    this.portalDistribution = new cloudfront.Distribution(this, 'PortalDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(portalBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    });
  }
}
