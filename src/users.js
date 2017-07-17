//@flow
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import r from 'rethinkdb'
import * as db from './rethinkdb'
import assert from 'assert'

export type User = {
  id: string,
  email: string,
  password: string,
  forenames: string,
  lastname: string,
  dealership: () => Promise<Dealership>,
  _dealership: string
}

const toUser = async (_user:*):Promise<User> => {
  assert(_user, 'User not found')
  assert(_user.id, 'Invalid user')
  assert(_user.forenames, 'Invalid user')
  assert(_user.lastname, 'Invalid user')
  assert(_user.email, 'Invalid user')
  assert(_user.password, 'Invalid user')

  return {
    id: _user.id,
    email: _user.email,
    password: _user.password,
    forenames: _user.forenames,
    lastname: _user.lastname,
    dealership: () => dealerships.get(_user.dealership),
    _dealership: _user.dealership
  }
}

export const getByEmail = (email:string):Promise<User> =>
  db.toArray(r.table('users').getAll(email, {index: 'email'}))
    .then(([x]) => x)
    .then(toUser)

export const get = (id:string):Promise<User> =>
  db.run(r.table('users').get(id))
    .then(toUser)
