//@flow
import r from 'rethinkdb'
import * as db from './rethinkdb'
import type {Dealership} from './dealerships'
import type {User} from './users'
import assert from 'assert'
import * as users from './users'
import * as dealerships from './dealerships'


export type Car = {
  brand: string,
  model: string,
  licenseplate: string,
}

export type Driver = {
  cpr: string,
  email: string,
  mobile: string,
  licenseUrl: string,
  forenames: string,
  lastname: string,
  street: string,
  houseNumber: string,
  floor: string,
  apartment: string,
  postcode: string,
  city: string,
  country: string
}

export type Testdrive = {
  id: string,
  user: () => Promise<User>,
  dealership: () => Promise<Dealership>,
  date: string,
  driver: Driver,
  car: Car,
  signature: string,
}

export type TestdriveInput = {
  id: string,
  user:string,
  dealership: string,
  date: string,
  driver: Driver,
  car: Car,
  signature: string,
}


const toCar = async (_car:*):Promise<Car> => {
  assert(_car, 'Invalid property Car')
  assert(_car.brand, 'Invalid property Car.brand')
  assert(_car.model, 'Invalid property Car.model')
  assert(_car.licenseplate, 'Invalid property Car.licenseplate')
  return {
    brand: _car.brand,
    model: _car.model,
    licenseplate: _car.licenseplate
  }
}

const toDriver = async (_driver:*):Promise<Driver> => {
  assert(_driver, 'Invalid property Driver')
  assert(_driver.email, 'Invalid Property Driver.email')
  assert(_driver.mobile, 'Invalid Property Driver.mobile')
  assert(_driver.cpr, 'Invalid Property Driver.cpr')
  assert(_driver.forenames, 'Invalid Property Driver.forenames')
  assert(_driver.lastname, 'Invalid Property Driver.lastname')
  assert(_driver.street, 'Invalid Property Driver.street')
  assert(_driver.postcode, 'Invalid Property Driver.postcode')
  assert(_driver.country, 'Invalid Property Driver.country')

  return {
    email: _driver.email,
    mobile: _driver.mobile,
    cpr: _driver.cpr,
    licenseUrl: _driver.licenseUrl,
    forenames: _driver.forenames,
    lastname: _driver.lastname,
    street: _driver.street,
    houseNumber: _driver.houseNumber,
    floor: _driver.floor,
    apartment: _driver.apartment,
    postcode: _driver.postcode,
    city: _driver.city,
    country: _driver.country,
  }
}


const toTestdrive = async (_testdrive:*):Promise<Testdrive> => {
  assert(_testdrive, 'Could not find Testdrive')
  assert(_testdrive.id, 'Invalid Testdrive')
  assert(_testdrive.user, 'Invalid Testdrive')
  assert(_testdrive.date, 'Invalid Testdrive')
  assert(_testdrive.dealership, 'Invalid Testdrive')
  assert(_testdrive.signature, 'Invalid Testdrive')

  const driver = await toDriver(_testdrive.driver)
  const car = await toCar(_testdrive.car)
  return {
    id: _testdrive.id,
    date: _testdrive.date,
    user: () => users.get(_testdrive.user),
    dealership: () => dealerships.get(_testdrive.dealership),
    car,
    driver,
    signature: _testdrive.signature
  }
}

export const getAll = (dealership:string):Promise<Testdrive[]> =>
  db.toArray(r.table('testdrives').getAll(dealership, {index:'dealership'}))
    .then(xs => Promise.all(xs.map(toTestdrive)))

export const create = (testdrive:TestdriveInput):Promise<Testdrive> => {
  return db.run(r.table('testdrives').insert(testdrive))
    .then(() => toTestdrive(testdrive))
}

export const get = (id:string):Promise<Testdrive> =>
  db.run(r.table('testdrives').get(id))
    .then(toTestdrive)
