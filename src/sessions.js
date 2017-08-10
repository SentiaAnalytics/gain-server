//@flow

import type {User} from './users'
import * as users from './users'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import type {Testdrive, TestdriveInput} from './testdrives'
import * as testdrives from './testdrives'
import type {Queue} from './queues'
import * as queues from './queues'
import type {Token} from './jwt'
import * as jwt from './jwt'
import type {CPRResult} from './cpr'
import cprLookup from './cpr'
import type {MySQLResult} from './mysql'
import mysql from './mysql'
import {v4 as uuid} from 'uuid'
import * as crypto from './crypto'
import * as util from './util'

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
    .then(q => q._dealership === _dealership ? q : Promise.reject(new Error('Could not fin queue')))
})

export const get = async (token:?string):Promise<Session> => {
  if (!token) return Promise.reject(new Error('Missing Session Token'))
  const {_user, _dealership} = await jwt.verify(token)
  return toSession(token, {_user, _dealership})
}

export const authenticate = async (email:string, password:string):Promise<Session> => {
  let user, res;
  try {
    user = await users.getByEmail(email)
    res = await crypto.compare(password, user.password)
  } catch (e) { 
    throw new Error('Invalid email or password')  
  }
  return get(jwt.sign({_user: user.id, _dealership: user._dealership}))
}
