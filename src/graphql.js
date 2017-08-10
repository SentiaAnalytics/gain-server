//@flow
import  graphqlHTTP from 'express-graphql'
import * as graphql from 'graphql'
import type {Session} from './sessions'
import * as sessions from './sessions'
import type {VisitorInput, VisitorStatus, VisitorUpdate} from './visitors'
import * as visitors from './visitors'
import * as testdrives from './testdrives'
import type {CarInput} from './cars'
import * as cars from './cars'
import * as queues from './queues'

export const schema = graphql.buildSchema(`

  input CarInput  {
    brand: String!
    model: String!
    disabled: Boolean!
    licenseplate: String!
  }

  input VisitorInput {
    name: String!
    mobile: String!
    type: VisitorType!
  }
  input VisitorUpdate {
    mobile:String
    name:String
    type:VisitorType
    email: String
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
  }

  type Dealership {
    id: ID!
    name: String!
    testdrives: [Testdrive!]!
    queues: [Queue!]!
    queue(id:String):Queue
    visitors: [Visitor!]!
    visitor(id: ID!): Visitor
    cars: [Car!]!
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
    visitor: Visitor
    car: Car
    driversLicense: String
  }

  type Car {
    id: ID!
    brand: String!
    model: String!
    disabled: Boolean!
    licenseplate: String!
    dealership: Dealership!
    time_created: String!
    created_by: User!

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
    Active,
    Served,
    Missed
  }

  enum VisitorType {
    NotAsked,
    Private,
    PrivateToBusiness,
    Business,
    NotAvailable
  }
  
  type PublicVisitor {
    id: ID!
    mobile:String!
    name:String!
    type:VisitorType!
    queue: PublicQueue!
    position: Int
    status: VisitorStatus!,
    time_queued: String!
    time_served: String
    time_done: String
    served_by: PublicUser
  }

  type PublicQueue {
    id: ID!
    name: String
    description: String
  }

  type PublicUser {
    id: ID
    email: String
    forenames: String
    lastname: String
  }

  type Visitor {
    id: ID!
    mobile:String!
    name:String!
    type:VisitorType!
    dealership: Dealership!
    queue: Queue!
    position: Int
    visits: [Visitor]!
    status: VisitorStatus!,
    time_queued: String!
    time_served: String
    time_done: String
    served_by: User
    email: String
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
  }

  type Session {
    token: String
    user: User
    dealership: Dealership
    cprLookup(cpr:String!): CPRResult
    mysql(query:String!):MySQLResult
  }

  type Public {
    visitor(id: String!): PublicVisitor
  }

  type Query {
    session(token: String):Session,
    public:Public,
    authenticate(email: String!, password: String!): Session
  }

  type Mutation {
    dequeue(visitorId:ID!): Visitor
    enqueue(queue: String!, visitor:VisitorInput!): Visitor,
    updateVisitorStatus(visitorId:ID!, status: VisitorStatus!): Visitor
    createQueue(name:String!, description:String!, order: String!): Queue
    createCar(car:CarInput!): Car
    updateCar(id:ID!, car:CarInput!):Car
    deleteCar(id:ID!): Boolean
    updateVisitor(id: ID!, visitorUpdate:VisitorUpdate):Visitor
    createTestdrive(visitor:ID!, car: ID!, driversLicense: String!): Testdrive
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
type UpdateVisitorStatus = {
  visitorId: string,
  status: VisitorStatus
};

type QueueInput = {
  name:string,
  description: string,
  order: string
}

type UpdateVisitor = {
  id:string,
  visitorUpdate: VisitorUpdate
}
type CreateTestdrive = {
  visitor: string,
  car: string,
  driversLicense: string
}

export const root = {
  session:({token}:Session, req:$Request) => sessions.get(token || req.get('Authorization')),
  public: {
    visitor: ({id}: {id:string}) => visitors.get(id).then(v => v)
  },
  authenticate: ({email, password}:Credentials) => sessions.authenticate(email, password),
  dequeue: ({visitorId}:Dequeue, req:$Request) =>  sessions.get(req.get('Authorization')).then(visitors.dequeue(visitorId)),
  enqueue: ({visitor, queue}:Enqueue, req:$Request) =>  sessions.get(req.get('Authorization')).then(visitors.enqueue(queue, visitor)),
  updateVisitorStatus: ({visitorId, status}:UpdateVisitorStatus, req:$Request) => sessions.get(req.get('Authorization')).then(visitors.updateStatus(visitorId, status)),
  updateVisitor: ({id, visitorUpdate}:UpdateVisitor, req:$Request) => sessions.get(req.get('Authorization')).then(visitors.update(id, visitorUpdate)),
  createQueue: ({name, description, order}: QueueInput, req:$Request) => sessions.get(req.get('Authorization')).then(queues.create(name, description, order)),
  createCar: ({car}: {car:CarInput}, req:$Request) => sessions.get(req.get('Authorization')).then(cars.create(car)),
  updateCar: ({id, car}: {id:string, car:CarInput}, req:$Request) => sessions.get(req.get('Authorization')).then(cars.update(id, car)),
  deleteCar: ({id}: {id:string}, req:$Request) => sessions.get(req.get('Authorization')).then(cars.del(id)),
  createTestdrive: ({car, visitor, driversLicense}:CreateTestdrive, req:$Request) => sessions.get(req.get('Authorization')).then(testdrives.create(car, visitor, driversLicense))

}

export default graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
})


