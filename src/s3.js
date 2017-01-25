//@flow
import AWS from 'aws-sdk'
import type {S3Record} from './model'
import Task from 'data.task'

const client = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: 'blah',//config.aws.credentials.accessKeyId,
  secretAccessKey: 'blah', //config.aws.credentials.secretAccessKey
  region: 'eu-west-1'
})

export const put = (params:S3Record) =>
  new Task((reject, resolve) =>
    client.putObject(params, (err, data) => err ? reject(err) : resolve(data))
  )
