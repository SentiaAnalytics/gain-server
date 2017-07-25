//@flow
import * as util from './util'
import * as db from './rethinkdb'
import * as sms from './sms'
import r from 'rethinkdb'
import {v4 as uuid} from 'uuid'
import D from 'date-fp'

import type {Session} from './sessions'

import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'

import type {User} from './users'
import * as users from './users'

import type {Queue} from './queues'
import * as queues from './queues'


export type VisitorInput = {
  mobile:string,
  name:string,
  type:string
}

export type VisitorStatus = 
  | "Waiting"
  | "Served"
  | "Active"
  | "Missed"


const STATUS_WAITING:VisitorStatus = "Waiting"
const STATUS_SERVED:VisitorStatus = "Served"
const STATUS_ACTIVE:VisitorStatus = "Active"
const STATUS_MISSED:VisitorStatus = "Missed"

export type Visitor = {
  id: string,
  dealership: () => Promise<Dealership>,
  queue:() => Promise<Queue>,
  mobile:string,
  name:string,
  type:string,
  position: () => Promise<number>,
  visits: () => Promise<Visitor[]>,
  status: string,
  time_queued: string,
  time_served: string,
  time_done: string,
  served_by: () => ?Promise<User>
}

const parseMobile = (mob:string) => {
  if (mob[0] === '+') return mob
  if (mob.slice(0, 2) === '00') return mob
  return "+45" + mob 
}

export const toVisitor = (_visitor:Object):Promise<Visitor> => {
  if (!_visitor) return Promise.reject(new Error('could not find visitor'))
  return Promise.resolve({
    id: _visitor.id,
    _dealership: _visitor.dealership,
    dealership: () => dealerships.get(_visitor.dealership),
    queue: () => queues.get(_visitor.queue),
    mobile: _visitor.mobile,
    name: _visitor.name,
    type: _visitor.type,
    time_queued: _visitor.time_queued,
    position: () => getPositionInQueue(_visitor),
    visits: () => getByMobile(_visitor.mobile),
    status: _visitor.status,
    time_served: _visitor.time_served,
    time_done: _visitor.time_done,
    served_by: () => _visitor.served_by ? users.get(_visitor.served_by) : null

  })
}

type Predicate<X> = (x:X) => bool

const _findIndex = <X>(i:number, f: Predicate<X>, [x, ...xs]:X[]):number => {
  if (x === undefined) return -1
  if (f(x)) return i
  return _findIndex(i+1, f, xs)
}

const findIndex = <X>(f: Predicate<X>, xs:X[]): number => _findIndex(0, f, xs)

export const get = (id:string):Promise<Visitor> =>
  db.run(r.table('visitors').get(id))
    .then(toVisitor)

export const getAll = (queue:string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).orderBy('time_queued'))
    .then(qs => Promise.all(qs.map(toVisitor)))

export const getCurrent = (queue:string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).filter(r.row('status').eq(STATUS_ACTIVE).or(r.row('status').eq(STATUS_WAITING))).orderBy('time_queued'))
    .then(qs => Promise.all(qs.map(toVisitor)))

export const getByDealership = (dealership: string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(dealership, {index: 'dealership'}).orderBy('time_queued'))
    .then(rows => Promise.all(rows.map(toVisitor)))

export const getByMobile = (mobile:string):Promise<Visitor[]> =>
  db.toArray(r.table('visitors').getAll(mobile, {index: 'mobile'}).orderBy('time_queued'))
    .then(rows => Promise.all(rows.map(toVisitor)))


export const getPositionInQueue = async ({id, dealership, queue}: {id:string, dealership:string, queue:string}):Promise<number> => {
    const q = await get(id)
    if (q.status !== STATUS_WAITING) return null
    const items = await db.toArray(r.table('visitors').getAll(queue, {index:'queue'}).filter({status: STATUS_WAITING, dealership}).orderBy('time_queued'))
    return findIndex(x => x.id === id, items) + 1
}

export const enqueue = (queue:string, visitorInput:VisitorInput) => (session:Session) => {
  const visitor = {
    id: uuid(),
    status: STATUS_WAITING,
    mobile:parseMobile(visitorInput.mobile),
    name:visitorInput.name,
    type:visitorInput.type,
    queue,
    dealership:session._dealership,
    time_queued: util.getTimestamp()
  }
  return db.run(r.table('visitors').insert(visitor))
    .then(() => getPositionInQueue(visitor))
    .then(pos => sms.send(visitor.mobile, `Thank you you are number ${pos} in the queue. Goto https:://app.gain.ai/visitor/${visitor.id} to see when your turn is up. as well as lots of interesting things about the dealership`))
    .then(() => toVisitor(visitor))

}

export const dequeue = (id:string) => async (session:Session):Promise<Visitor> => {
  const visitor = await db.run(r.table('visitors').getAll(id).filter({dealership: session._dealership}).nth(0))
  if (visitor.status !== STATUS_WAITING) return Promise.reject(new Error('Visitor must have status waiting'))
  const update = {
    status: STATUS_ACTIVE,
    time_served: util.getTimestamp(),
    served_by: session._user
  }

  await db.run(r.table('visitors').get(id).update(update))
  return get(id)
}

export const updateStatus = (id:string, status:VisitorStatus) => async (session:Session):Promise<Visitor> => {
  const visitorBefore = await db.run(r.table('visitors').getAll(id).filter({dealership: session._dealership}).nth(0))
  console.log('visitorBefore', visitorBefore)
  if (visitorBefore.status !== 'Active') throw new Error(`Visitor must be ${STATUS_ACTIVE} but was ${visitorBefore.status}`)

  await db.run(r.table('visitors').get(id).update({status, time_done: util.getTimestamp()}))

  const visitor = await db.run(r.table('visitors').getAll(id).filter({dealership: session._dealership}).nth(0))

  return toVisitor(visitor)
}