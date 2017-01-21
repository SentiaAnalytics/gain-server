//@flow

export type Driver = {
  cpr: string,
  firstname: string,
  lastname: string,
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
  licenseplate: string
}

export type Concent = {
  base64Signature:string
}

export type Testdrive = {
  driver: Driver,
  car: Car,
  concent: Concent
}

export const emptyDriver:Driver = {
  cpr: '',
  firstname: '',
  lastname: '',
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
  licenseplate: ''
}

export const emptyConcent:Concent = {
  base64Signature: ''
}

export const emptyTestdrive:Testdrive = {
  driver: emptyDriver,
  car: emptyCar,
  concent: emptyConcent
}
