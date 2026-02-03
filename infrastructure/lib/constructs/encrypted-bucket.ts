import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';

export interface EncryptedBucketProps {
  encryptionKey: kms.IKey;
  versioned?: boolean;
  lifecycleRules?: s3.LifecycleRule[];
  corsRules?: s3.CorsRule[];
}

/** S3 bucket with KMS encryption, versioning, and public access blocked */
export class EncryptedBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: EncryptedBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'Bucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.encryptionKey,
      bucketKeyEnabled: true,
      versioned: props.versioned ?? true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: props.lifecycleRules,
      cors: props.corsRules,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });
  }
}
