//@flow
import oolonRethink from 'oolon-rethink'
import r from 'rethinkdb'
import config from './config'
import Task from 'data.task'

const wrapPromise = f => (...args:any[]) =>
  new Task((reject, resolve) => f(...args).then(resolve, reject))

const query = oolonRethink(config.rethinkdb)

export const toArray = wrapPromise(query.toArray)
export const run = wrapPromise(query.run)
export const each = wrapPromise(query.each)
export const eachAsync = wrapPromise(query.eachAsync)
