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
  jwt_secret: process.env.JWT_SECRET,
  licenses: {
    bucket: 'sentia-testdrive'
  },
  testdrives: {
    tableName: 'testdrive-testdrives'
  },
  pnr : {
    userID: process.env.CPR_USER_ID,
    username: process.env.CPR_USERNAME,
    password: process.env.CPR_PASSWORD,
    host: process.env.CPR_HOST
  }
}
