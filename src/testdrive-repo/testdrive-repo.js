//@flow weak
import r from 'rethinkdb'
import {compose} from 'ramda'
import Task from 'data.task'

const getTestdrivesQuery = dealership =>
  r.table('testdrives').getAll(dealership, {index:'dealership'})

export const getAll = db =>
  compose(db.toArray, getTestdrivesQuery)

export const create = (db, uuid) => _doc => {
  const doc = {id: uuid(), ..._doc}
  return db.run(r.table('testdrives').insert(doc))
    .map(() => doc)
}
