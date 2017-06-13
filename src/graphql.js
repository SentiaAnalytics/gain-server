//@flow
import  graphqlHTTP from 'express-graphql'
import * as graphql from 'graphql'
import * as sessions from './sessions'
import * as testdrives from './testdrives'

const schema = graphql.buildSchema(`

  input CarInput  {
    brand: String!
    model: String!
    licenseplate: String!
  }

  input DriverInput {
    email: String!
    mobile: String!
    cpr: String!
    forenames: String!
    lastname: String!
    street: String!
    houseNumber: String!
    floor: String!
    apartment: String!
    postcode: String!
    city: String!
    country: String!
    licenseUrl: String!
  }

  input TestdriveInput {
    driver: DriverInput!
    car: CarInput!
    signature: String
  }

  type Driver {
    email: String!
    mobile: String!
    cpr: String!
    forenames: String!
    lastname: String!
    street: String!
    houseNumber: String!
    floor: String!
    apartment: String!
    postcode: String!
    city: String!
    country: String!
    licenseUrl: String!
  }

  type Car {
    brand: String!
    model: String!
    licenseplate: String!
  }

  type Testdrive {
    id: ID!
    user: User!
    dealership: Dealership!
    date: String!
    driver: Driver!
    car: Car!
    signature: String
  }

  type User {
    id: ID!
    email: String!
    forenames: String!
    lastname: String!
    dealership: Dealership!
  }

  type Dealership {
    id: ID!
    name: String!
    testdrives: [Testdrive]!
  }

  type CPRResult {
    pnr: String
    forenames: String
    lastname: String
    sex: String
    dob: String
    occupation: String
    street: String
    buildingNumber: String
    floor: String
    apartment: String
    city: String
    postcode: String
    postDistrict: String
    directMarketingProtectionDate: String
    formattedName: String
    houseNumber: String
    locality: String
    moveInDate: String
    municipalityCode: String
    nameAddrressProtectionDate: String
    pnrStatus: String
    standardAddress: String
    status: String
    statusDate: String
    streetCode: String
    tutelageDate: String
    type: String
  }

  type Session {
    token: String!
    user: User!
    dealership: Dealership!
    createTestdrive(testdriveInput:TestdriveInput):Testdrive
    cprLookup(cpr:String!): CPRResult
  }

  type Query {
    session(token: String):Session,
    authenticate(email: String!, password: String!): Session
  }
`)

const root = {
  session:({token}, req) => sessions.get(token || req.get('Authorization')),
  authenticate: ({email, password}) => sessions.authenticate(email, password),
}


export default graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
})
