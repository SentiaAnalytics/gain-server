//@flow

import type {Server} from 'http'
import SocketIO from 'socket.io'
import { schema, root } from './graphql'
import { graphql } from 'graphql'

import config from './config'
import r from 'rethinkdb'
import { parse } from 'url'

import util from 'util';

const getConnectionOptions = (url) => {
  const { hostname, port, path, auth } = parse(url)
  const options = {
      host: hostname,
      port: port,
      db: path.split('/')[path.split('/').length - 1]
  }
  if (auth) {
    const [user, password] = auth.split(':')
    return { ...options, user, password }
  } else {
      return options
  }
}

export const fetchQueueData = (visitorId: string):Promise => {
    const visitorQuery = `
    query {
        public {
            visitor(id: "${visitorId}") {
                id
                mobile
                position
                status
                name
                queue {
                    id
                    name
                    description
                }
                served_by {
                    id
                    email
                    forenames
                    lastname
                }
            }
        }
    }`
    return graphql(schema, visitorQuery, root)
        .then(result => {
            if (result.errors) {
                return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
            } else {
                return Promise.resolve(result)
            }
        })
}

let visitors = {};

export const setupVisitorSocket = async (server:Server) => {
    const io = new SocketIO(server);

    io.on('connection', async (socket) => {
        const visitorId = socket.handshake.query.visitorId
        
        if (!visitorId) {
            console.log(`Connection attempted by ${socket.id}: No visitorId in handshake -- disconnecting`)
            socket.disconnect()
        } else {
            console.log(`Connection from ${socket.id}, visitorId: ${visitorId}`)

            try {
                const result = await fetchQueueData(visitorId)

                const visitor = {
                    socket: socket,
                    id: visitorId,
                    queueId: result.data.public.visitor.queue.id
                }

                visitors[socket.id] = visitor

                socket.on('disconnect', () => {
                    console.log(`Disconnect from ${socket.id}, visitorId: ${visitor.id}`)
                    delete visitors[socket.id]
                    console.log(`Now serving ${getVisitors().length} visitors`)
                })
                console.log(`Now serving ${getVisitors().length} visitors`)
            }
            catch (err) {
                console.log(`Error when accepting connection from ${socket.id}, visitorId: ${visitorId}: ${err}`)
                visitors[socket.id].socket.disconnect()
                delete visitors[socket.id]
            }            
        }
    })
    return io
}

const getVisitors = () => {
    let list = []
    let id;
    for (id in visitors) {
        if (visitors.hasOwnProperty(id)) {
            list.push(visitors[id])
        }
    }

    return list;
}

const updateVisitors = async () => {
    let visitor;
    getVisitors().forEach(async visitor => {
        const result = await fetchQueueData(visitor.id)
        visitor.socket.emit('UpdateVisitorMessage', result)
    })
}

setInterval(updateVisitors, 1000)