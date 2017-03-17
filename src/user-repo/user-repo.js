//@flow weak
import {chain, compose} from 'ramda'
import Task from 'data.task'
import r from 'rethinkdb'


const getFirstItem = ([x]) =>
  new Task((reject, resolve) => x ? resolve(x): reject('Invalid email or password'))

const getUserQuery = (email:string) => r.table('users').getAll(email, {index:'email'})

export const getUserWithPassword = db =>
  compose(chain(getFirstItem), db.toArray, getUserQuery)
