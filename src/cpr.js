//@flow
import sentiaPNR from 'sentia-pnr'
import config from './config'

export type CPRResult = {
  pnr : string,
  forenames : string,
  lastname : string,
  sex : string,
  dob : string,
  occupation : string,
  street : string,
  buildingNumber : string,
  floor : string,
  apartment : string,
  city : string,
  postcode : string,
  postDistrict : string,
  directMarketingProtectionDate : string,
  formattedName : string,
  houseNumber : string,
  locality : string,
  moveInDate : string,
  municipalityCode : string,
  nameAddrressProtectionDate : string,
  pnrStatus : string,
  standardAddress : string,
  status : string,
  statusDate : string,
  streetCode : string,
  tutelageDate : string,
  type : string,
}

const client = sentiaPNR({
  logging: false,
  userID: config.pnr.userID,
  username: config.pnr.username,
  password: config.pnr.password,
  host: config.pnr.host
})

export default async (cprNumber:string):Promise<CPRResult> => {
  try {
    const result = await client(cprNumber)
    return result.body['001']
  } catch (e) {
    return Promise.reject(new Error(e.errorDetails))
  }
}
