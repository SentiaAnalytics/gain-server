// @flow
import type {Testdrive} from './model'
import {emptyTestdrive} from './model'


const testdrive: Testdrive = {
  ...emptyTestdrive,
  concent: {
    base64Signature: 'HEllo there'
  }
}
