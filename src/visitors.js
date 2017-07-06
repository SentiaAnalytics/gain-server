//@flow
import * as db from './rethinkdb'
import r from 'rethinkdb'
import {v4 as uuid} from 'uuid'
import D from 'date-fp'

import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'

import type {Queue} from './queues'
import * as queues from './queues'

const WAITING = "Waiting"
const SERVED = "Served"

export type Visitor = {
  id: string,
  dealership: () => Promise<Dealership>,
  queue:() => Promise<Queue>,
  status: string,
  mobile:string,
  time: string,
  position: () => Promise<number>
}

export const toVisitor = (_visitor:Object):Promise<Visitor> => {
  if (!_visitor) return Promise.reject(new Error('could not find visitor'))
  return Promise.resolve({
    id: _visitor.id,
    dealership: () => dealerships.get(_visitor.dealership),
    queue: () => queues.get(_visitor.queue),
    status: _visitor.status,
    mobile: _visitor.mobile,
    time: _visitor.time,
    position: () => getPositionInQueue(_visitor)
  })
}

type Predicate<X> = (x:X) => bool
const _findIndex = <X>(i:number, f: Predicate<X>, [x, ...xs]:X[]):number => {
  if (x === undefined) return -1
  if (f(x)) return i
  return _findIndex(i+1, f, xs)
}

const findIndex = <X>(f: Predicate<X>, xs:X[]): number => _findIndex(0, f, xs)


export const get = (id:string) =>
  db.run(r.table('visitors').get(id))

export const getAll = (queue:string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).orderBy('time'))
    .then(qs => Promise.all(qs.map(toVisitor)))

export const getCurrent = (queue:string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).filter({status: WAITING}).orderBy('time'))
    .then(qs => Promise.all(qs.map(toVisitor)))

export const getByDealership = (dealership: string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(dealership, {index: 'dealership'}))
    .then(rows => Promise.all(rows.map(toVisitor)))


export const dequeue = async (id:string):Promise<Visitor> => {
  const visitor = await get(id)
  if (visitor.status !== WAITING) return Promise.reject(new Error('Visitor must have status waiting'))
  const update = {
    status: SERVED,
    served: D.format('YYYY-MM-DDTHH:mm:ssZ', new Date())
  }

  await db.run(r.table('visitors').get(id).update(update))
  return get(id)
}

export const getPositionInQueue = async ({id, dealership, queue}: {id:string, dealership:string, queue:string}):Promise<number> => {
    const q = await get(id)
    if (q.status !== WAITING) return Promise.reject(new Error('Item not active in queue'))
    const items = await db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).filter({status: WAITING, dealership}).orderBy('time'))
    return findIndex(x => x.id === id, items)
}

export const create = (mobile:string, queue:string, dealership:string) => {
  const visitor = {
    id: uuid(),
    status: WAITING,
    mobile,
    queue,
    dealership,
    time: D.format('YYYY-MM-DDTHH:mm:ssZ', new Date())
  }
  return db.run(r.table('visitors').insert(visitor))
    .then(() => toVisitor(visitor))

}
