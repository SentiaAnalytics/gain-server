//@flow

import D from 'date-fp'
import type {User} from './users'
import * as users from './users'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import type {Testdrive, TestdriveInput} from './testdrives'
import * as testdrives from './testdrives'
import type {Token} from './jwt'
import * as jwt from './jwt'
import type {CPRResult} from './cpr'
import cprLookup from './cpr'
import {v4 as uuid} from 'uuid'
import * as crypto from './crypto'


export type Session = {
  token: string,
  _user: string,
  user: () => Promise<User>,
  _dealership: string,
  dealership: () => Promise<Dealership>,
  createTestdrive: (props:{testdriveInput:TestdriveInput}) => Promise<Testdrive>,
  cprLookup: (props:{cpr:string}) => Promise<CPRResult>
}

const toSession = (token:string, {_user, _dealership}: Token):Session =>
({
  token,
  _user,
  user: () => users.get(_user),
  _dealership,
  dealership: () => dealerships.get(_dealership),
  createTestdrive: ({testdriveInput}) =>
    testdrives.create({
      ...testdriveInput,
      id: uuid(),
      user: _user,
      dealership: _dealership,
      date: D.format('YYYY-MM-DDTHH:mm:ss', new Date())
    }),
  cprLookup: ({cpr}) => cprLookup(cpr)
})

export const get = async (token:?string):Promise<Session> => {
  if (!token) return Promise.reject(new Error('Missing Session Token'))
  const {_user, _dealership} = await jwt.verify(token)
  return toSession(token, {_user, _dealership})
}

export const authenticate = async (email:string, password:string):Promise<Session> => {
  const user = await users.getByEmail(email)
  await crypto.compare(password, user.password)
  return get(jwt.sign({_user: user.id, _dealership: user._dealership}))
}
