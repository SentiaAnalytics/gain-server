// @flow

import type {DynamoDbRecord} from './model'
import config from './config'

export default function(put) {
  return (req, res, next) => {
    const {user, date, driver, car, consent} = req.body

    const dynamoDbParams:DynamoDbRecord = {
      TableName: config.userid.tableName,
      Item: {
        user,
        date,
        dealership: req.body.dealership,
        ...driver,
        ...car,
        ...consent
      }
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