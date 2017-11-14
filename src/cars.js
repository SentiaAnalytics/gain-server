//@flow
import * as db from './rethinkdb'
import r from 'rethinkdb'
import * as util from './util'
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import type {User} from './users'
import * as users from './users'
import type {Session} from './sessions'
import {v4 as uuid} from 'uuid'

export type CarStatus = "Home" | "Out" | "Not Available"
export type CarInput = {
  brand:string,
  model:string,
  disabled?:bool,
  licenseplate:string,
}
export type Car = {
  id: string,
  brand:string,
  model:string,
  disabled: bool,
  licenseplate:string,
  dealership: () => Promise<Dealership>,
  _dealership: string,
  time_created: string,
  created_by: () => Promise<User>,
  _created_by: string
}

const carQuery = (id:string, dealership:string) => r.table('cars').getAll(id).filter({dealership}).nth(0)

export const toCar = (_car:*):Car => {
  return {
    id: _car.id,
    brand: _car.brand,
    model: _car.model,
    disabled: _car.disabled,
    licenseplate: _car.licenseplate,
    time_created: _car.time_created,
    dealership: () => dealerships.get(_car.dealership),
    _dealership: _car.dealership,
    created_by: () => users.get(_car.created_by),
    _created_by: _car.created_by
  }
}

export const create = (carInput: CarInput) => async (session:Session) => {
  let car = {
    ...carInput,
    id: uuid(),
    time_created: util.getTimestamp(),
    dealership: session._dealership,
    created_by: session._user
  }
  await db.run(r.table('cars').insert(car))
  return toCar(car)
}

export const get = async (id:string): Promise<Car> => {
  const car = await db.run(r.table('cars').get(id))
  return toCar(car)
}

export const getByDealership = async (dealership:string): Promise<Car[]> => {
  let cars:*[] = await db.toArray(r.table('cars').getAll(dealership, {index: 'dealership'}))
  return cars.map(toCar)
}

export const update = (id:string, carInput:CarInput) => async (session:Session) => {
  let changes = await db.run(carQuery(id, session._dealership).update(carInput))
  let car = await db.run(carQuery(id, session._dealership))
  return toCar(car)
};

export const del = (id:string) => (session:Session) =>
  db.run(carQuery(id, session._dealership).delete())
    .then(changes => changes.deleted === 1)
    .catch(err => (console.log(err), Promise.reject(new Error(`Kunne ikke finde bil med id: ${id}`))))