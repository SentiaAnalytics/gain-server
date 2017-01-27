const awsCredentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

export default {
  aws: {
    s3: {
      ...awsCredentials,
      endpoint: process.env.S3_ENDPOINT,
      region: 'eu-west-1'
    },
    dynamodb: {
      ...awsCredentials,
      endpoint: process.env.DYNAMO_ENDPOINT,
      region: 'eu-west-1'
    }
  },
  licenses: {
    bucket: 'sentiatestDrive'
  },
  userid: {
    tableName: 'testDrive'
  }
}
