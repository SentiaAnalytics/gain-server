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
import jwt from 'jsonwebtoken'
import config from './config'
import * as emails from './emails'

export type Token = {
  id: string
}

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
  assert(_user, 'Brugeren findes ikke')
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
  if (admin.role !== "Admin") throw new Error('Du skal være administrator for at oprette brugere')


  const existingUsers = await db.toArray(r.table('users').getAll(userInput.email, {index: 'email'}))
  if (existingUsers.length !== 0) throw new Error('En bruger med den email findes allerede')

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
  if (admin.role !== "Admin") throw new Error('Du skal være administrator for at oprette brugere')
  
  await db.run(r.table('users').get(userid).update(userInput))
  let user = await db.run(r.table('users').get(userid))
  return toUser(user)
};

export const del = async (userid: string, session:Session) => {
  let admin = await db.run(r.table('users').get(session._user))
  if (admin.role !== "Admin") throw new Error('Du skal være administrator for at oprette brugere')
  if (admin.id === userid) throw new Error("Du kan ikke slette dig selv");

  let result = await db.run(r.table('users').get(userid).delete())
  console.log(result);
  return userid;
};

export const createResetToken = (id:string,):string => jwt.sign({id}, config.jwt_reset_password, {expiresIn: '10m'})

export const decodeJWT = (token:string):Token => jwt.decode(token)

export const verifyJWT = (token:string):Promise<Token> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, config.jwt_reset_password, (err, data) =>
        err ? reject(err): resolve(decodeJWT(token))
      )
  )
export const requestPasswordReset = async (email: string) => {
  let user = await getByEmail(email);
  if (!user) return "Hvis en bruger med den indtastede email eksisterer vil du modtage en mail med et link"
  let token = createResetToken(user.id)
  console.log(token)
  await emails.sendResetPassword(user, token)
  return "Hvis en bruger med den indtastede email eksisterer vil du modtage en mail med et link";
};

export const resetPassword = async (token:string, password:string) => {
  let {id} = await verifyJWT(token)
  let user = await get(id)
  if (!user) throw new Error("Kunne ikke finde en matchende bruger")
  let hash = await crypto.hash(password)
  await db.run(r.table('users').get(id).update({password:hash}))
  return toUser(user)
}