// @flow
import uuid from 'uuid/v4'
import type {DynamoDbRecord} from './model'
import config from './config'
import {pick, mapObj} from './util'

const TESTDRIVE_REQUEST_PROPS = [
  'cpr',
  'licenseUrl',
  'firstname',
  'lastname',
  'addressLine1',
  'addressLine2',
  'postcode',
  'city',
  'country',
  'carBrand',
  'carModel',
  'licenseplate',
  'email',
  'phone'
]


export const get = query =>
  (req, res, next) => {
    const {dealership} = req.user
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
    const {user, dealership} = req.user
    const testdriveRequest = pick(TESTDRIVE_REQUEST_PROPS)(req.body)
    const item = {
      id: uuid(),
      user,
      dealership,
      date:new Date().toUTCString(),
      ...testdriveRequest
    }


    const dynamoDbParams:DynamoDbRecord = {
      TableName: config.testdrives.tableName,
      Item: mapObj(x => x === '' ? null : x)(item)
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
