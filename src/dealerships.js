//@flow
import * as db from './rethinkdb'
import r from 'rethinkdb'
import type {Testdrive} from './testdrives'
import * as testdrives from './testdrives'
import assert from 'assert'

export type Dealership = {
  name:string,
  id:string,
  testdrives: () => Promise<Testdrive[]>
}

const toDealership = async (_dealership:*):Promise<Dealership> => {
  assert(_dealership, 'Invalid dealership')
  assert(_dealership.id, 'Invalid dealership')
  assert(_dealership.name, 'Invalid dealership')
  assert(_dealership.testdrives, 'Invalid dealership')
  return {
    id: _dealership.id,
    name: _dealership.name,
    testdrives: () => testdrives.getAll(_dealership.id)
  }
}

export const get = (id: string):Promise<Dealership> =>
  db.run(r.db('testdrive').table('dealerships').get(id))
    .then(toDealership)
