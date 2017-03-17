//@flow
import AWS from 'aws-sdk'
import config from './config'
import type {S3Record} from './model'
import Task from 'data.task'

const client = new AWS.S3(config.aws.s3)

export default {
  put: (params:S3Record) =>
  new Task((reject, resolve) =>
    client.putObject(params, (err, data) => err ? reject(err) : resolve(data))
  )
}
