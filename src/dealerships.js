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


export type Dealership = {
  name:string,
  id:string,
  testdrives: () => Promise<Testdrive[]>,
  queues: () => Promise<Queue[]>,
  queue: (props: {id: string}) => Promise<Queue>
}

const toDealership = async (_dealership:*):Promise<Dealership> => {
  assert(_dealership, 'Invalid dealership')
  assert(_dealership.id, 'Invalid dealership')
  assert(_dealership.name, 'Invalid dealership')
  assert(_dealership.testdrives, 'Invalid dealership')
  return {
    id: _dealership.id,
    name: _dealership.name,
    testdrives: () => testdrives.getAll(_dealership.id),
    queues: () => queues.getAll(_dealership.id),
    queue: ({id}) => queues.get(id)
      .then(q => q._dealership === _dealership.id ? q : Promise.reject(new Error('Could not fin queue'))),
    visitors: () => visitors.getByDealership(_dealership.id),
    visitor: ({id}) => visitors.get(id)
      .then((visitor:Visitor) => visitor._dealership === _dealership.id ? visitor : null)
  }
}

export const get = (id: string):Promise<Dealership> =>
  db.run(r.table('dealerships').get(id))
    .then(toDealership)
