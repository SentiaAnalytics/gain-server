//@flow
import type {Dealership} from './dealerships'
import * as dealerships from './dealerships'
import r from 'rethinkdb'
import * as db from './rethinkdb'
import assert from 'assert'
import * as util from './util'
import type {Session} from './sessions'
import * as sessions from './sessions'
import * as crypto from './crypto'

export type UserInput = {
  email: string,
  forenames: string,
  lastname: string
}

export type User = {
  id: string,
  role: "Admin" | "User",
  email: string,
  password: string,
  forenames: string,
  lastname: string,
  dealership: () => Promise<Dealership>,
  _dealership: string
}

const toUser = async (_user:*):Promise<User> => {
  assert(_user, 'User not found')
  return {
    id: _user.id,
    role: _user.role || "User",
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

export const getByDealership = (dealership:string):Promise<User[]> =>
  db.toArray(r.table('users').getAll(dealership, {index: 'dealership'}))
    .then(users => Promise.all(users.map(toUser)))


export const get = (id:string):Promise<User> =>
  db.run(r.table('users').get(id))
    .then(toUser)

export const create = async (userInput:UserInput, session:Session) => {
  let admin = await db.run(r.table('users').get(session._user))
  if (admin.role !== "Admin") throw new Error('You do not have permission to create new users')


  const existingUsers = await db.toArray(r.table('users').getAll(userInput.email, {index: 'email'}))
  if (existingUsers.length !== 0) throw new Error('A user with that email already exists')

  let password = await crypto.hash(util.uuid());

  const user = {
    id: util.uuid(),
    role: "User",
    password,
    email: userInput.email,
    forenames: userInput.forenames,
    lastname: userInput.lastname, 
    dealership: session._dealership
  }

  await db.run(r.table('users').insert(user))
  return toUser(user)
};

export const update = async (userid: string, userInput:User, session:Session) => {
  let admin = await db.run(r.table('users').get(session._user))
  if (admin.role !== "Admin") throw new Error('You do not have permission to create new users')
  
  await db.run(r.table('users').get(userid).update(userInput))
  let user = await db.run(r.table('users').get(userid))
  return toUser(user)
};

export const del = async (userid: string, session:Session) => {
  let admin = await db.run(r.table('users').get(session._user))
  if (admin.role !== "Admin") throw new Error('You do not have permission to create new users')
  if (admin.id === userid) throw new Error("You cannot delete your self");

  let result = await db.run(r.table('users').get(userid).delete())
  console.log(result);
  return userid;
};