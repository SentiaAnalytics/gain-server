
import fetch from 'node-fetch'
import config from './config'
import jwt from 'jsonwebtoken'
import HttpError from 'http-errors'
import * as sessions from './sessions'
import * as users from './users'
import React from 'react'
import {renderToString} from 'react-dom/server'
import TestdriveReport from './templates/testdriveReport'

export const decodeJWT = (token:string):Token => jwt.decode(token)

export const verifyJWT = (token:string):Promise<Token> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, config.testdrive_report_jwt_secret, (err, data) =>
        err ? reject(HttpError.Unauthorized(err)): resolve(decodeJWT(token))
      )
  )

const fetchTestdriveData = async (testdrive, authToken) => {
  const query = `
    query TestdriveReport($testdrive: ID!) {
      session {
        dealership {
          
          testdrive(id: $testdrive) {
            id
            signature
            created_by {
              forenames
              lastname
              email
            }
            dealership {
              name
              street
              houseNumber
              floor
              postcode
              city
              country
            }
            visitor {
              forenames
              lastname
              cpr
              email
              mobile
            }
            car {
              brand
              model
              licenseplate
            }
          }
        }
      }
    }
  `

  const res = await fetch("http://localhost:8090/graphql", {
    method: "POST",
    headers: {"Authorization": authToken, "Content-Type": "application/json"},
    body: JSON.stringify({query, variables: {testdrive}, operationName: "TestdriveReport"})
  });
  return res.json()
}

const handler = async (token) => {
  const {_testdrive, _user, _dealership} = await verifyJWT(token)
  const authToken = sessions.createAuthToken(_user, _dealership)
  const {data} = await fetchTestdriveData(_testdrive, authToken)

  const {testdrive} = data.session.dealership
  return renderToString(<TestdriveReport testdrive={testdrive}/>)
}

export default async (req, res) => {
  const token = req.params.token
  handler(token)
    .then(r => res.send(r))
    .then(err => res.status(err.status).send(err.message))


}