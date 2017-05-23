// @flow weak
import config from '../config'
import {pick, map} from 'ramda'
import D from 'date-fp'

export const getAll = repo =>
  (req, res, next) =>
    repo.getAll(req.user.dealership)
      .fork(
        next,
        xs => res.send(xs)
      )

export const create = repo =>
  (req, res, next) => {
    const {email: user, dealership} = req.user
    const testdriveRequest = req.body
    const item = {
      user,
      dealership,
      date: D.format('YYYY-MM-DDTHH:mm:ss', D.fromTime(Date.now())),
      ...testdriveRequest
    }
    repo.create(item)
      .fork(
        e => res.status(401).send(e),
        x => res.send(x)
      )
  }
