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
    }
  },
  mysql: process.env.MYSQL_URL,
  rethinkdb: process.env.RETHINKDB_URL,
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
    host: process.env.CPR_HOST,
    logging: true
  },
  emailTransport: {
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  sms: {
    accountSid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_TOKEN,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE,
    sendSms: process.env.SEND_SMS === "true",

  }
}
