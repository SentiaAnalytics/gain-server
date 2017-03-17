//@flow
import {getUserWithPassword} from './user-repo'
import type {User, Credentials} from './model'
import {map, omit, chain, compose} from 'ramda'
import * as jwt from './jwt'
import * as crypto from './crypto'

const log = key => value => (console.log(key, value), value)

const validateUserPassword = (password:string) => (user:User) =>
  crypto.compare(password)(user.password)
    .bimap(_ => "Invalid Email or Password", _ => user)

const validateUser = (password: string) =>
  compose(map(omit(['password'])), chain(validateUserPassword(password)), getUserWithPassword)


export const authenticate = (req:any, res:any) => {
  const {password, email} = req.body
  validateUser(password)(email)
    .map(user => ({user, token:jwt.sign(user)}))
    .fork(
      e => {
        console.log(e.stack || e)
        res.status(401).send(e)
      },
      data => res.send(data)
    )
}

export const validate = (req:any, res:any, next:Function) => {
  const token = req.get('Authorization')

  if (!token) return res.status(403).send('you must provide a valid Authorization header')
  jwt.verify(token)
    .fork(
      () => res.status(403).send('Invalid auth token'),
      () => {
        req.user = jwt.decode(token)
        if (!req.user.dealership) {
          return next (new Error('user is not associated with a dealership'))
        }
        console.log(req.user)
        next()
      }
    )
}

export const getSession = (req:any, res:any, next:Function) => {
    res.send(req.user)
}
