//@flow
import {query} from './dynamodb'
import {map} from './util'

export const getUser = (email:string) =>
  map(x=> x.Items[0])(query({
    TableName: "testdrive-users",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email
    }
  }))
