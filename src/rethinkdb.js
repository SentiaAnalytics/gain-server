//@flow
import oolonRethink from 'oolon-rethink'
import r from 'rethinkdb'
import config from './config'
import Task from 'data.task'

const db = oolonRethink(config.rethinkdb)

export const toArray = <T>(query:*):Promise<T[]> => db.toArray(query)
export const run = (query:*):Promise<*> => db.run(query)
