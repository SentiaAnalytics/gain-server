//@flow

export type Credentials = {
  email: string,
  password: string
}

export type User = {
  email: string,
  password: string,
  dealership: string
}

export type S3Record = {
  Bucket: string,
  Key: string,
  Body: any
}

export type DynamoDbPutRecord = {
  TableName: string,
  Item: Dict
}

export type Dict = {[string]:any}

export type Driver = {
  cpr: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  addressLine1: string,
  addressLine2: string,
  postcode: string,
  city: string,
  country: string
}

export type Car = {
  make: string,
  model: string,
  licensePlate: string
}

export type Consent = {
  base64Signature:string
}

export type Testdrive = {
  id: string,
  user: string,
  dealership: string,
  date: string,
  cpr: string,
  licenseUrl: string,
  forenames: string,
  lastname: string,
  street: string,
  houseNumber: string,
  floor: string,
  apartment: string,
  postcode: string,
  city: string,
  country: string,
  carBrand: string,
  carModel: string,
  licenseplate: string,
  email: string,
  mobile: string,
  base64Signature: string,
}
