//@flow
import  {graphqlConnect} from 'apollo-server-express'
import config from './config'
import fs from 'fs'
import path from 'path'
import * as graphql from 'graphql'
import type {Session} from './sessions'
import * as sessions from './sessions'
import type {VisitorInput, VisitorStatus, VisitorUpdate} from './visitors'
import * as visitors from './visitors'
import * as testdrives from './testdrives'
import type {CarInput} from './cars'
import * as cars from './cars'
import * as queues from './queues'
import type {User, UserInput} from './users' 
import * as users from './users'


const gqlSchema = fs.readFileSync('src/schema.graphql').toString('utf-8')
export const schema = graphql.buildSchema(gqlSchema)

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
  signature: string
}

const createTestdrive = async ({car, visitor, signature}:CreateTestdrive, req:$Request) => {
  let session = await sessions.get(req.get('Authorization'))
  let testdrive = await testdrives.create(car, visitor, signature, req.body.data)(session)
  return testdrive;
}

const createUser = async ({user}:{user:User}, req:$Request):Promise<User> => {
  let session = await sessions.get(req.get('Authorization'))
  return users.create(user, session)
}

const updateUser = async ({userId, user}:{userId:string, user:User}, req:$Request):Promise<User> => {
  let session = await sessions.get(req.get('Authorization'))
  return users.update(userId, user, session)
}


export const root = {
  version: require('../package.json').version,
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
  createTestdrive: ({car, visitor, signature}:CreateTestdrive, req:$Request) => sessions.get(req.get('Authorization')).then(testdrives.create(car, visitor, signature, req.body.data)),
  finishTestDrive: ({visitorId}:Dequeue, req:$Request) =>  sessions.get(req.get('Authorization')).then(visitors.finishTestDrive(visitorId)),
  createUser,
  updateUser,
}

export default graphqlConnect(req => { 
  return {
    schema,
    context: req,
    rootValue: root
  }
})



