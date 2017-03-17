//@flow weak
import test from 'tape'
import sinon from 'sinon'
import r from 'rethinkdb'
import Task from 'data.task'
import * as repo from './testdrive-repo.js'

test('should call db.getall with a query', t => {
  t.plan(2)
  const results = [{id: 'testdrive'}]
  const db = {toArray: sinon.spy(() => Task.of(results))}
  repo.getAll(db)('dealership')
    .fork(
        t.fail, xs => t.equal(xs, results)
    )
  t.equal(db.toArray.calledOnce, true)
})

test('should call db.run with a new testdrive', t => {
  t.plan(1)
  const doc = {name: 'testdrive'}
  const db = {run: sinon.spy(() => Task.of('ok'))}
  const uuid = () => 'id'
  repo.create(db, uuid)(doc)
    .fork(
      t.fail,
      x => {
        t.deepEquals(x, {id: 'id', ...doc}, 'should return the new doc')
      }
    )
})
