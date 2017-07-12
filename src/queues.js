//@flow
import * as db from './rethinkdb'
import D from 'date-fp'
import r from 'rethinkdb'
import {v4 as uuid} from 'uuid'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import type {Visitor} from './visitors'
import * as visitors from './visitors'

export type Queue = {
  id:string,
  name: string,
  dealership:() => Promise<Dealership>,
  _dealership: string,
  visitors: () => Promise<Visitor[]>,
  currentVisitors: () => Promise<Visitor[]>,
  enqueue: (props: {visitor:Visitor}) => Promise<Visitor>,
  dequeue: (props: {id:string}) => Promise<Visitor>
}

const toQueue = (_queue:Object):Promise<Queue> => {
  if (!_queue) return Promise.reject(new Error('Missing Queue'))

  return Promise.resolve({
    id: _queue.id,
    dealership: () => dealerships.get(_queue.dealership),
    _dealership: _queue.dealership,
    name: _queue.name,
    visitors: () => visitors.getAll(_queue.id),
    currentVisitors: () => visitors.getCurrent(_queue.id),
    enqueue: ({visitor}) => visitors.create(visitor, _queue.id, _queue.dealership),
    dequeue: ({id}) => visitors.dequeue(id)
  })
}

export const create = (name:string, dealership:string):Promise<Queue> => {
  const queue = {
    id: uuid(),
    dealership,
    name
  }
  return db.run(r.table('queues').insert(queue))
    .then(() => toQueue(queue))
}

export const get = (id:string) =>
  db.run(r.table('queues').get(id))
    .then(toQueue)

export const getAll = (dealership:string) =>
  db.toArray(r.table('queues').getAll(dealership, {index:'dealership'}))
    .then(res => Promise.all(res.map(toQueue)))
