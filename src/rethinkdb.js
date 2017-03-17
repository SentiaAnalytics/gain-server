//@flow
import oolonRethink from 'oolon-rethink'
import r from 'rethinkdb'
import config from './config'
import Task from 'data.task'

const wrapPromise = f => (...args:any[]) =>
  new Task((reject, resolve) => f(...args).then(resolve, reject))

const query = oolonRethink(config.rethinkdb)

export const toArray = wrapPromise(oolonRethink.toArray)
export const run = wrapPromise(oolonRethink.run)
export const each = wrapPromise(oolonRethink.each)
export const eachAsync = wrapPromise(oolonRethink.eachAsync)
