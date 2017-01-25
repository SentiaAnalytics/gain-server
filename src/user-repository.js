//@flow
import {query} from './dynamodb'
import {chain} from './util'
import Task from 'data.task'

const getFirstItem = result =>
  new Task((reject, resolve) => result.Items[0] ? resolve(result.Items[0]): reject('Invalid email or password'))

export const getUser = (email:string) =>
  chain(getFirstItem)(query({
    TableName: "testdrive-users",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email
    }
  }))
