//@flow
import bcrypt from 'bcryptjs'

export const hash = (data:string) =>
  new Promise((resolve, reject) =>
    bcrypt.genSalt(10, (err, salt) =>
      err ? reject(err) : bcrypt.hash(data, salt, (err, hash) =>
        err ? reject(err) : resolve(hash)
      )
    )
  )

export const compare = (plain:string) => (hash:string) =>
  new Promise((resolve, reject) =>
    bcrypt.compare(plain, hash, (err, res) =>
      err ? reject(err) : res ? resolve(plain) : reject('wrong password')
    )
  )
