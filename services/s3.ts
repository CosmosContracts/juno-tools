import { PutObjectCommand, S3, ListBucketsCommand } from '@aws-sdk/client-s3'
import {
  S3_BUCKET,
  S3_ENDPOINT,
  S3_KEY,
  S3_REGION,
  S3_SECRET,
} from 'utils/constants'

const corsConfig = {
  AllowedHeaders: ['Authorization'],
  AllowedMethods: ['GET', 'POST', 'PUT', 'HEAD'],
  AllowedOrigins: ['*'],
  ExposeHeaders: [],
  MaxAgeSeconds: 3000,
}
const corsRules = new Array(corsConfig)
const corsParams = {
  Bucket: S3_BUCKET,
  CORSConfiguration: { CORSRules: corsRules },
}

const PARAMS = {
  Bucket: S3_BUCKET,
  ACL: 'private',
}

const s3Client = new S3({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_KEY,
    secretAccessKey: S3_SECRET,
  },
})

s3Client.putBucketCors(corsParams, (err: any, data: any) => {
  if (err) {
    console.log('Error', err)
  } else {
    console.log('Success', data)
  }
})

export const uploadObject = async (key: string, body: any) => {
  const data = await s3Client.send(
    new PutObjectCommand({ ...PARAMS, Key: key, Body: body })
  )
  return data
}
