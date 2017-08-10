//@flow
import D from 'date-fp'
import {v4 as uuid} from 'uuid'

export const getTimestamp = ():string =>
  D.format('YYYY-MM-DDTHH:mm:ssZ', new Date())

  export {uuid}
