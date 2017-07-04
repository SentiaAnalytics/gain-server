//@flow
import D from 'date-fp'

export const getTimestamp = ():string =>
  D.format('YYYY-MM-DDTHH:mm:ssZ', new Date())
