//@flow
import  graphqlHTTP from 'express-graphql'
import * as graphql from 'graphql'
import type {Session} from './sessions'
import * as sessions from './sessions'
import type {VisitorInput} from './visitors'
import * as visitors from './visitors'
import * as publicField from './publicField'
import * as testdrives from './testdrives'

export const schema = graphql.buildSchema(`

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
    signature: String!
  }

  input VisitorInput {
    name: String
    mobile: String
    type:String
  }

  type Dealership {
    id: ID
    name: String
    testdrives: [Testdrive]
    queues: [Queue]
    queue(id:String):Queue
    visitors: [Visitor]
    visitor(id: String!): Visitor
  }

  type User {
    id: ID
    email: String
    forenames: String
    lastname: String
    dealership: Dealership
  }

  type Testdrive {
    id: ID
    user: User
    dealership: Dealership
    date: String
    driver: Driver
    car: Car
    signature: String
  }

  type Driver {
    email: String
    mobile: String
    cpr: String
    forenames: String
    lastname: String
    street: String
    houseNumber: String
    floor: String
    apartment: String
    postcode: String
    city: String
    country: String
    licenseUrl: String
  }

  type Car {
    brand: String
    model: String
    licenseplate: String
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

  type MySQLResult {
    data: String
    fields: [MySQLField]
  }

  type MySQLField {
    catalog: String
    db: String
    table: String
    orgTable: String
    name: String
    orgName: String
    charsetNr: Int
    length: Int
    type: Int
    flags: Int
    decimals: Int
    default: Boolean
    zeroFill: Boolean
    protocol41: Boolean
  }

  type Queue {
    id: ID!
    name: String
    description: String
    order: String
    dealership: Dealership
    visitors: [Visitor]
    currentVisitors: [Visitor],
  }

  enum VisitorStatus {
    Waiting,
    Served
  }

  enum VisitorType {
    Private,
    Business,
    PrivateToBusiness,
    Na
  }

  type Visitor {
    id: ID!
    mobile:String
    name:String
    type:VisitorType
    time: String
    dealership: Dealership
    queue: Queue
    position: Int
    status: VisitorStatus
  }

  type Session {
    token: String
    user: User
    dealership: Dealership
    createQueue(name:String, description:String, order:String):Queue
    createTestdrive(testdriveInput:TestdriveInput):Testdrive
    cprLookup(cpr:String!): CPRResult
    mysql(query:String!):MySQLResult
  }

  type PublicField {
    visitor(id: String): Visitor
  }

  type Query {
    session(token: String):Session,
    publicField:PublicField,
    authenticate(email: String!, password: String!): Session
  }

  type Mutation {
    dequeue(visitorId:ID!): Visitor
    enqueue(queue: String, visitor:VisitorInput): Visitor 
  }
`)

type Credentials = {
  email:string,
  password:string
}
type Enqueue = {
  visitor:VisitorInput,
  queue: string
}

type Dequeue = {
  visitorId: string
}


export const root = {
  session:({token}:Session, req:$Request) => sessions.get(token || req.get('Authorization')),
  publicField: publicField.get(),
  authenticate: ({email, password}:Credentials) => sessions.authenticate(email, password),
  dequeue: ({visitorId}:Dequeue, req:$Request) =>  sessions.get(req.get('Authorization')).then(visitors.dequeue(visitorId)),
  enqueue: ({visitor, queue}:Enqueue, req:$Request) =>  sessions.get(req.get('Authorization')).then(visitors.enqueue(queue, visitor))
}

export default graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
})


