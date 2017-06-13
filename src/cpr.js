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

export default (cprNumber:string):Promise<CPRResult> =>
  client(cprNumber)
    .then(x => x.body['001'])
    .catch(x => Promise.reject(new Error(x)))
