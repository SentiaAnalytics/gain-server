//@flow
import test from 'tape'
import sinon from 'sinon'
import Task from 'data.task'
import * as userRepo from './user-repo'

test('userRepo.getUser should return an existing user', t => {
  t.plan(1)
  const user = {email: 'user@example.com', password: 'password'}
  const db = {toArray: sinon.spy(() => Task.of([user]))}
  userRepo.getUserWithPassword(db)('user@exampe.com')
    .fork(
      e => t.fail(e),
      x => t.deepEquals(x, user, 'return the user')
    )
})

test('userRepo.getUser return an error for non existing user', t => {
  t.plan(1)
  const user = {email: 'user@example.com', password: 'password'}
  const db = {toArray: sinon.spy(() => Task.of([]))}
  userRepo.getUserWithPassword(db)('user@exampe.com')
    .fork(
      e => t.deepEquals(e, 'Invalid email or password'),
      x => t.fail('should not return a user')
    )
})
