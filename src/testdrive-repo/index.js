//@flow weak
import * as testdriveRepo from './testdrive-repo.js'
import * as db from '../rethinkdb'
import {v4 as uuid}  from 'uuid'

export const getAll = testdriveRepo.getAll(db)
export const create = testdriveRepo.create(db, uuid)
export const get = testdriveRepo.get(db)
