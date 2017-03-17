//@flow weak
import * as userRepo from './user-repo'
import * as db from '../rethinkdb'

export const getUserWithPassword = userRepo.getUserWithPassword(db)
