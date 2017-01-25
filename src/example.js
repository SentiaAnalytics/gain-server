// @flow
import type {Testdrive} from './model'
import {emptyTestdrive} from './model'

const testdrive:Testdrive = Object.assign(
  {},
  emptyTestdrive, {
    consent: {
      base64Signature: 'HEllo there'
    }
  })
