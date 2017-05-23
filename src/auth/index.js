//@flow weak
import * as auth from './auth'
import * as userRepo from '../user-repo'

export const validate = auth.validate
export const authenticate = auth.authenticate(userRepo)
export const getSession = auth.getSession
