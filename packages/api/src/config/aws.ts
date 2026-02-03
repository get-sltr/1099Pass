import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { KMSClient } from '@aws-sdk/client-kms';
import { SESClient } from '@aws-sdk/client-ses';
import { SNSClient } from '@aws-sdk/client-sns';

let s3: S3Client | undefined;
let dynamodb: DynamoDBDocumentClient | undefined;
let secrets: SecretsManagerClient | undefined;
let kms: KMSClient | undefined;
let ses: SESClient | undefined;
let sns: SNSClient | undefined;

export function getS3Client(): S3Client {
  if (!s3) s3 = new S3Client({});
  return s3;
}

export function getDynamoDBClient(): DynamoDBDocumentClient {
  if (!dynamodb) {
    const client = new DynamoDBClient({});
    dynamodb = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return dynamodb;
}

export function getSecretsManagerClient(): SecretsManagerClient {
  if (!secrets) secrets = new SecretsManagerClient({});
  return secrets;
}

export function getKMSClient(): KMSClient {
  if (!kms) kms = new KMSClient({});
  return kms;
}

export function getSESClient(): SESClient {
  if (!ses) ses = new SESClient({});
  return ses;
}

export function getSNSClient(): SNSClient {
  if (!sns) sns = new SNSClient({});
  return sns;
}
