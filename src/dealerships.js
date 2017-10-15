//@flow
import * as db from './rethinkdb'
import r from 'rethinkdb'
import type {Testdrive} from './testdrives'
import * as testdrives from './testdrives'
import type {Queue} from './queues'
import * as queues from './queues'
import assert from 'assert'
import type {Visitor} from './visitors'
import * as visitors from './visitors'
import type {Car} from './cars'
import * as cars from './cars'


export type Dealership = {
  name:string,
  id:string,
  street: string,
  houseNumber: string,
  floor: string,
  postcode: string,
  city: string,
  country: string,
  testdrives: () => Promise<Testdrive[]>,
  queues: () => Promise<Queue[]>,
  queue: (props: {id: string}) => Promise<Queue>,
  cars: () => Promise<Car[]>,
  testdrive: (props: {id:string}) => Promise<Testdrive>,
}

const toDealership = async (_dealership:*):Promise<Dealership> => {
  assert(_dealership, 'Invalid dealership')
  assert(_dealership.id, 'Invalid dealership')
  assert(_dealership.name, 'Invalid dealership')
  return {
    id: _dealership.id,
    name: _dealership.name,
    street: _dealership.street,
    houseNumber: _dealership.houseNumber,
    floor: _dealership.floor,
    postcode: _dealership.postcode,
    city: _dealership.city,
    country: _dealership.country,
    testdrives: () => testdrives.getAll(_dealership.id),
    queues: () => queues.getAll(_dealership.id),
    queue: ({id}) => queues.get(id)
      .then(q => q._dealership === _dealership.id ? q : Promise.reject(new Error('Could not find queue'))),
    visitors: () => visitors.getByDealership(_dealership.id),
    visitor: ({id}) => visitors.get(id)
      .then((visitor:Visitor) => visitor._dealership === _dealership.id ? visitor : null),
    cars: () => cars.getByDealership(_dealership.id),
    testdrive: ({id}) => testdrives.get(id)
  }
}

export const get = (id: string):Promise<Dealership> =>
  db.run(r.table('dealerships').get(id))
    .then(toDealership)
