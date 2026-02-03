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

export class StorageStack extends cdk.Stack {
  public readonly documentsBucket: s3.IBucket;
  public readonly reportsBucket: s3.IBucket;
  public readonly portalDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    // Documents bucket
    const documents = new EncryptedBucket(this, 'DocumentsBucket', {
      encryptionKey: props.encryptionKey,
      versioned: true,
      lifecycleRules: [
        { id: 'ia-90', transitions: [{ storageClass: s3.StorageClass.INTELLIGENT_TIERING, transitionAfter: cdk.Duration.days(90) }] },
        { id: 'glacier-365', transitions: [{ storageClass: s3.StorageClass.GLACIER, transitionAfter: cdk.Duration.days(365) }] },
      ],
      corsRules: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'], // Tighten in prod
        allowedHeaders: ['*'],
        maxAge: 3000,
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
      bucketName: `1099pass-${props.environment}-lender-portal`,
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
