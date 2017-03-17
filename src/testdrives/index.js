//flow weak
import * as testdrives from './testdrives'
import * as repo from '../testdrive-repo'
import uuid from 'uuid/v4'

export const getAll = testdrives.getAll(repo)
export const create = testdrives.create(repo)
