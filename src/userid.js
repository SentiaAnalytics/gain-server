// @flow
import uuid from 'uuid/v4'
import type {DynamoDbRecord} from './model'
import config from './config'

export default function(put) {
  return (req, res, next) => {
    const {driver, car, consent} = req.body
    const {email:user, dealership} = req.user
    const item = {
      id: uuid(),
      user,
      date:new Date().toUTCString(),
      dealership,
      ...driver,
      ...car,
      ...consent
    }
    const dynamoDbParams:DynamoDbRecord = {
      TableName: config.userid.tableName,
      Item: item
    }

    put(dynamoDbParams)
      .fork(e => {
        res.status(401).send(e)
        next(e)
      }, () => {
        res.status(200).send(req.body)
        next()
      })
  }
}
