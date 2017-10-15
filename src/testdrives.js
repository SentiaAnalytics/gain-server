//@flow
import r from 'rethinkdb'
import * as db from './rethinkdb'
import type {Dealership} from './dealerships'
import type {User} from './users'
import type {Visitor} from './visitors'
import * as visitors from './visitors'
import type {Car} from './cars'
import * as cars from './cars'
import assert from 'assert'
import * as users from './users'
import * as dealerships from './dealerships'
import * as util from './util'
import type {Session} from './sessions'
import config from './config';
import jwt from 'jsonwebtoken';
import * as sms from './sms'

export type Testdrive = {
  id: string,
  crated_by: () => Promise<User>,
  _crated_by: string,
  dealership: () => Promise<Dealership>,
  _dealership: string,
  time_created: string,
  visitor: () => Promise<Visitor>,
  _visitor: string,
  car: () => Promise<Car>,
  _car: string,
  signature: string,
  driversLicense: string
  

}

const toTestdrive = async (_testdrive:*):Promise<Testdrive> => {
  assert(_testdrive, 'Could not find Testdrive')

  return {
    id: _testdrive.id,
    time_created: _testdrive.time_created,
    created_by: () => users.get(_testdrive.created_by),
    _created_by:_testdrive.created_by,
    dealership: () => dealerships.get(_testdrive.dealership),
    _dealership: _testdrive.dealership,
    car: () => cars.get(_testdrive.car),
    _car: _testdrive.car,
    visitor: () => visitors.get(_testdrive.visitor),
    _visitor: _testdrive.visitor,
    _driversLicense: _testdrive.driversLicense,
    signature: _testdrive.signature,
    driversLicense: _testdrive.driversLicense
  }
}

export const getAll = (dealership:string):Promise<Testdrive[]> =>
  db.toArray(r.table('testdrives').getAll(dealership, {index:'dealership'}))
    .then(xs => Promise.all(xs.map(toTestdrive)))

export const create = (car:string, visitor:string, signature: string, driversLicense:string) => async (session:Session):Promise<Testdrive> => {
  const _car = await cars.get(car)
  if (_car._dealership !== session._dealership) throw new Error('Car does not exist')
  if (_car.disabled) throw new Error('Car is disabled')

  const _visitor = await visitors.get(visitor)
  if (_visitor._dealership !== session._dealership) throw new Error('Visitor does not exist')
  const testdrive = {
    id: util.uuid(),
    car,
    visitor,
    signature,
    driversLicense,
    dealership: session._dealership,
    created_by: session._user,
    time_created: util.getTimestamp()
  }
  await db.run(r.table('testdrives').insert(testdrive))
  const token = await jwt.sign({_testdrive: testdrive.id, _user: session._user, _dealership: session._dealership}, config.testdrive_report_jwt_secret, {})
  console.log(token)
  const smsBody = `
    Tak fordi du prøver vores ${_car.brand} ${_car.model}.
    Du kan finde din køreseddel her: https://gain.ai:8090/testdrives/${token}
    God fornøjelse!
  `
  await sms.send(_visitor.mobile, smsBody)

  return toTestdrive(testdrive)
}

export const get = (id:string):Promise<Testdrive> =>
  db.run(r.table('testdrives').get(id))
    .then(toTestdrive)
