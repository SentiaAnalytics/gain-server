//@flow

import type {User} from './users'
import * as users from './users'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import type {Testdrive} from './testdrives'
import * as testdrives from './testdrives'
import type {Queue} from './queues'
import * as queues from './queues'
import type {CPRResult} from './cpr'
import cprLookup from './cpr'
import type {MySQLResult} from './mysql'
import mysql from './mysql'
import {v4 as uuid} from 'uuid'
import * as crypto from './crypto'
import * as util from './util'
import jwt from 'jsonwebtoken'
import config from './config'

export type Token = {
  _user: string,
  _dealership: string
}

export const createAuthToken = (_user:String, _dealership:String):string => jwt.sign({_user, _dealership}, config.jwt_session, {expiresIn: '10d'})

export const decodeJWT = (token:string):Token => jwt.decode(token)

export const verifyJWT = (token:string):Promise<Token> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, config.jwt_session, (err, data) =>
        err ? reject(err): resolve(decodeJWT(token))
      )
  )

const log = (key:string) => (value:any) => (console.log(key, value), value)

export type Session = {
  token: string,
  _user: string,
  user: () => Promise<User>,
  _dealership: string,
  dealership: () => Promise<Dealership>,
  cprLookup: (props:{cpr:string}) => Promise<CPRResult>,
  mysql: (props: {query:string}) => Promise<MySQLResult<string>>,
  queues: () => Promise<Queue[]>,
  queue: (props: {id:string}) => Promise<Queue>
}

const toSession = (token:string, {_user, _dealership}: Token):Session =>
({
  token,
  _user,
  user: () => users.get(_user),
  _dealership,
  dealership: () => dealerships.get(_dealership),
  cprLookup: ({cpr}) => cprLookup(cpr),
  mysql:({query}) => mysql(query)
    .then(({data, fields}) => ({data: JSON.stringify(data), fields})),
  queues: () => queues.getAll(_dealership),
  queue: ({id}) => queues.get(id)
    .then(q => q._dealership === _dealership ? q : Promise.reject(new Error('Kunne ikke finde den pågældende kø')))
})

export const get = async (token:?string):Promise<Session> => {
  if (!token) return Promise.reject(new Error('Mangler en session token'))
  const {_user, _dealership} = await verifyJWT(token)
  return toSession(token, {_user, _dealership})
}

export const authenticate = async (email:string, password:string):Promise<Session> => {
  let user, res;
  try {
    user = await users.getByEmail(email)
    res = await crypto.compare(password, user.password)
  } catch (e) { 
    throw new Error('Ugyldig bruger eller password')  
  }
  return get(createAuthToken(user.id, user._dealership))
}
