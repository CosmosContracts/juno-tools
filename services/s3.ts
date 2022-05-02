import { PutObjectCommand, S3 } from '@aws-sdk/client-s3'
import { S3_BUCKET, S3_ENDPOINT, S3_KEY, S3_REGION, S3_SECRET } from 'utils/constants'

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

export const uploadObject = async (key: string, body: string) => {
  const data = await s3Client.send(new PutObjectCommand({ ...PARAMS, Key: key, Body: body }))
  return data
}
