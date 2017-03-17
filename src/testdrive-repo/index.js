//@flow weak
import * as testdriveRepo from './testdrive-repo.js'
import * as db from '../rethinkdb'

export const getAll = testdriveRepo.getAll(db)
export const create = testdriveRepo.create(db)
