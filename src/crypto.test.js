//@flow weak
import * as crypto from './crypto'
import test from 'tape'

const passwordHash = '$2a$10$bgYQ/34GTVR.XLRumBT7W.8gY.v5L6vrea86Y7osvW8RPp/rfcQbO'

test('crypto.compare should work for hashes generated by crypto.hash', t => {
  t.plan(1)
  crypto.hash('password')
    .chain(crypto.compare('password'))
    .fork(
      t.fail,
      t.ok
    )
})

test('crypto.compare should return an error when given a wrong plain text pass', t => {
  t.plan(1)
  crypto.hash('password')
    .chain(crypto.compare('not password'))
    .fork(
      t.ok,
      t.fail
    )
})
