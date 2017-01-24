//@flow
import AWS from 'aws-sdk'
import type {Dict} from './model'
import Task from 'data.task'

const client = new AWS.DynamoDB.DocumentClient();
export const query = (params:Dict) =>
  new Task((reject, resolve) =>
    client.query(params, (err, data) => err ? reject(err) : resolve(data))
  )
export const scan = (params:Dict) =>
  new Task((reject, resolve) =>
    client.query(params, (err, data) => err ? reject(err) : resolve(data))
  )
