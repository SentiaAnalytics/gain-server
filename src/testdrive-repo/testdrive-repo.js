//@flow weak
import r from 'rethinkdb'
import {evolve} from 'ramda'
import Task from 'data.task'

const getTestdrivesQuery = dealership =>
  r.table('testdrives').getAll(dealership, {index:'dealership'})

export const getAll = db => dealership =>
  db.toArray(getTestdrivesQuery(dealership))

export const create = (db, uuid) => _doc => {
  const doc = {id: uuid(), ..._doc}
  return db.run(r.table('testdrives').insert(doc))
    .map(() => doc)
}

export const get = db => id =>
  db.run(r.table('testdrives').get(id))
