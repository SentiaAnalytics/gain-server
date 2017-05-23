//@flow weak
import test from 'tape'
import sinon from 'sinon'
import * as auth from './auth'

const mockExpressObjects = (req = {}) => (
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

test('auth.getSession should return the sessions user object', t => {
  t.plan(2)
   const {req, res, next} = mockExpressObjects()
   auth.getSession(req, res, next)
   t.equal(res.send.calledOnce, true, 'call next once')
   t.equal(res.send.args[0][0], req.user, 'call with user')
})
