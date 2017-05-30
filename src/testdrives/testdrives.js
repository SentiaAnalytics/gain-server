// @flow weak
import config from '../config'
import {pick, map} from 'ramda'
import D from 'date-fp'
import testdriveReport from './testdrive-report'
import pdf from '../pdf'

const log = key => value => (console.log(key, value), value)

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

export const get = repo =>
  (req, res, next) =>
    repo.get(req.params.testdriveId)
      .fork(
        next,
        testdrive => res.send(testdrive)
      )

export const getHTML = repo =>
  (req, res, next) =>
    repo.get(req.params.testdriveId)
      .map(testdriveReport)
      .fork(
        next,
        html => {
          res.set('Content-Type', 'text/html')
          res.send(html)
        }
      )

export const getPDF = repo =>
  (req, res, next) =>
    repo.get(req.params.testdriveId)
      .map(testdriveReport)
      .map(log('html'))
      .chain(pdf)
      .fork(
        next,
        pdf => {
          res.set('Content-Type', 'application/pdf')
          pdf.pipe(res)
        }
      )
