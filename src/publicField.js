//@flow

import type {Visitor} from './visitors'
import * as visitors from './visitors'

export type PublicField = {
  visitor: (arg:{id:string}) => Promise<Visitor> 
}

const toPublic = ():PublicField =>
({
  visitor: ({id}) => visitors.get(id).then(v => v)
})

export const get = ():PublicField => {
  return toPublic()
}
