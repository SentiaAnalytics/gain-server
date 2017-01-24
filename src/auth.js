//@flow
import {getUser} from './user-repository.js'
import type {User, Credentials} from './model'
import jwt from 'jsonwebtoken'
import Task from 'data.task'
import bcrypt from 'bcryptjs'
import {map, omit, chain, compose} from './util'

const SECRET = "shhhhh"

const log = key => value => (console.log(key, value), value)


const validatePassword = (password:string) => (user:User) =>
  new Task((reject, resolve) =>
    bcrypt.compare(password, user.password, (err, res) => res ? resolve(user) : reject(err|| 'invalid email or password')))

const validateUser = (password: string) =>
  compose(map(omit(['password'])), chain(validatePassword(password)), getUser)


export const login = (req:any, res:any) => {
  const {password, email} = req.body
  validateUser(password)(email)
    .fork(
      e => {
        console.log(e.stack || e)
        res.status(401).send(e)
      },
      user => {
        res.cookie('jwt', jwt.sign(user, SECRET))
        res.send(user)
      }
    )
}

export const validate = (req:any, res:any, next:Function) => {
  if (!req.cookies.jwt) return res.status(403).send('you must be logged in')
  const token = req.cookies.jwt
  return jwt.verify(token, SECRET) ? next() : res.status(403).send('you must be logged in')
}
