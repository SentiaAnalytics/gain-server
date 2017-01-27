//@flow
import bcrypt from 'bcryptjs'
import Task from 'data.task'

export const hash = (data:string) =>
  new Task((reject, resolve) =>
    bcrypt.getSalt(10, (err, salt) =>
      err ? reject(err) : bcrypt.hash(data, salt, (err, hash) =>
        err ? reject(err) : resolve(hash)
      )
    )
  )

export const compare = (plain:string) => (hash:string) =>
  new Task((reject, resolve) =>
    bcrypt.compare(plain, hash, (err, res) =>
      err ? reject(err) : res ? resolve() : reject('wrong password')
    )
  )
