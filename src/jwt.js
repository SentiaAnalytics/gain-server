//@flow
import Task from 'data.task'
import type {Dict} from './model'
import jwt from 'jsonwebtoken'
import config from './config'

export const sign = (data:Dict) => jwt.sign(data, config.jwt_secret)

export const verify = (token:string) =>
  new Task((reject, resolve) =>
  jwt.verify(token, config.jwt_secret, (err, data) =>
      err ? reject(err): resolve(data)
    )
  )
