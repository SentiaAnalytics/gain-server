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
  driver: Driver,
  car: Car,
  consent: Consent
}

export const emptyDriver:Driver = {
  cpr: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  postcode: '',
  city: '',
  country:''
}

export const emptyCar:Car = {
  make: '',
  model: '',
  year: '',
  licensePlate: ''
}

export const emptyConsent:Consent = {
  base64Signature: ''
}

export const emptyTestdrive:Testdrive = {
  driver: emptyDriver,
  car: emptyCar,
  consent: emptyConsent
}
