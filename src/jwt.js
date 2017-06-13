//@flow
import type {Dict} from './model'
import jwt from 'jsonwebtoken'
import config from './config'

export type Token = {
  _user: string,
  _dealership: string
}

export const sign = (data:Token):string => jwt.sign(data, config.jwt_secret)

export const verify = (token:string):Promise<Token> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, config.jwt_secret, (err, data) =>
        err ? reject(err): resolve(jwt.decode(token))
      )
  )

export const decode = (token:string):Token => jwt.decode(token)
