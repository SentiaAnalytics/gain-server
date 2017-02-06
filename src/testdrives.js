// @flow
import uuid from 'uuid/v4'
import type {DynamoDbRecord} from './model'
import config from './config'
import {pick} from './util'


export const get = query =>
  (req, res, next) => {
    const {dealership} = req.user
    console.log(req.user)
    const params = {
      Limit: 50,
      TableName : config.testdrives.tableName,
      KeyConditionExpression: "dealership = :dealership",
      ExpressionAttributeValues: {
          ":dealership": dealership
      }
    }

    query(params)
      .map(x => x.Items)
      .fork(
        next,
        xs => res.send(xs)
      )

  }

export const post = put =>
  (req, res, next) => {
    const {driver, car, consent} = req.body
    const {email:user, dealership} = req.user
    const item = {
      id: uuid(),
      user,
      dealership,
      date:new Date().toUTCString(),
      driver,
      car,
      consent
    }

    const dynamoDbParams:DynamoDbRecord = {
      TableName: config.testdrives.tableName,
      Item: item
    }

    put(dynamoDbParams)
      .fork(e => {
        res.status(401).send(e)
        next(e)
      }, () => {
        res.status(200).send(item)
        next()
      })
  }
