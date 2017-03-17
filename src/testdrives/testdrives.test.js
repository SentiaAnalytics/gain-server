//@flow weak
import test from 'tape'
import sinon from 'sinon'
import Task from 'data.task'
import * as testdrives from './testdrives'

const mockExpressObjects = (req) => (
  {
    req: {
      user: {
        user: 'user@example.com',
        dealership: 'dealership'
      },
      ...req
    },
    res: {
      send: sinon.spy(),
      status: sinon.spy()
    },
    next: sinon.spy()

  }
)

test('testdrives.getAll', t => {
    t.plan(5)

  const repo = {getAll: sinon.spy(() => Task.of([{id: 'testdrive'}]))}
  const {req, res, next} = mockExpressObjects({})
  testdrives.getAll(repo)(req, res, next)

  t.equals(repo.getAll.calledOnce, true, 'call getAll')
  t.equals(repo.getAll.args[0][0], 'dealership')

  t.equals(next.called, false, 'should not return error')

  t.equals(res.send.calledOnce, true, 'call res.send once')
  t.deepEqual(res.send.args[0][0], [{id: 'testdrive'}], 'return results')
})

test('testdrives.create', t => {
  t.plan(3)
  const doc = {name: 'testdrive'}
  const repo = {create: sinon.spy(() => Task.of({id: 'id', ...doc }))}
  const {req, res, next} = mockExpressObjects({body: doc})
  testdrives.create(repo)(req, res, next)
  t.equal(next.called, false, 'should not return an error')
  t.equal(res.send.calledOnce, true, 'should call res.send once')
  t.deepEquals(res.send.args[0][0], {id: 'id', ...doc }, 'should return the new doc')
})
