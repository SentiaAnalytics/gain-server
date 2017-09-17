//@flow
import {uuid} from './util'
import type {Session} from './sessions'
import * as db from './rethinkdb'
import r from 'rethinkdb'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'

export type DriverLicense = {
  id: string,
  dealership: Promise<Dealership>,
  _dealership: string,
  base64: string
}

export const toLicense = (_license:*):DriverLicense => ({
  id: _license.id,
  _dealership: _license.dealership,
  dealership: () => dealerships.get(_license.dealership),
  base64: _license.license
})

export const create = (license:string) => async (session:Session) => {
  let item = {
    id: uuid(),
    base64: license,
    dealership: session._dealership
  }

  await db.run(r.table('driversLicenses').insert(item))
  return toLicense(item)
}

export const get = async (id:string) => {
  let _license  = await db.run(r.table('driversLicenses').get(id))
  return toLicense(_license)
}