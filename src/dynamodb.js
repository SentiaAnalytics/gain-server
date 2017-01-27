//@flow
import AWS from 'aws-sdk'
import type {Dict, DynamoDbPutRecord} from './model'
import config from './config'
import Task from 'data.task'

const client = new AWS.DynamoDB.DocumentClient(config.aws.dynamodb);

export default {
  put: (params:DynamoDbPutRecord) =>
    new Task((reject, resolve) =>
      client.put(params, (err, data) => err ? reject(err) : resolve(data))
    ),

  query: (params:Dict) =>
    new Task((reject, resolve) =>
      client.query(params, (err, data) => err ? reject(err) : resolve(data))
    ),

  scan: (params:Dict) =>
    new Task((reject, resolve) =>
      client.query(params, (err, data) => err ? reject(err) : resolve(data))
    )
}
