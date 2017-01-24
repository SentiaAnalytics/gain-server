//@flow
import AWS from 'aws-sdk'
import type {S3Record} from './model'
import Task from 'data.task'

const client = new AWS.S3();
export const put = (params:S3Record) =>
  new Task((reject, resolve) =>
    client.putObject(params, (err, data) => err ? reject(err) : resolve(data))
  )
