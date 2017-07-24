//@flow

import type {Server} from 'http'
import SocketIO from 'socket.io'
import { schema, root } from './graphql'
import { graphql } from 'graphql'

import config from './config'
import r from 'rethinkdb'
import { parse } from 'url'

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
        publicField {
            visitor(id: "${visitorId}") {
                id
                mobile
                position
                status
                dealership {
                    id
                    name
                }
                queue {
                    id
                    name
                }
            }
        }
    }`
    return graphql(schema, visitorQuery, root)
        .then(result => {
            if (result.errors) {
                return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
            } else {
                return Promise.resolve(formatDataForSocket(result.data.publicField))
            }
        })
}

const formatDataForSocket = (data) => {
    return {
        name: data.visitor.queue.name,
        position: data.visitor.position,
        id: data.visitor.queue.id
    }
}

let sockets = {};
let users = {};

export const setupQueueSocket = (server:Server) => {
    const io = new SocketIO(server);

    io.on('connection', async (socket) => {
        console.log(socket.handshake.query)
        const visitorId = socket.handshake.query.visitorId
        const user = {
            id: socket.id,
            visitorId: visitorId
        }
        
        console.log(`Connection attempt from ${socket.id}`)

        if (!visitorId) {
            console.log(`No visitorId supplied`)
            socket.disconnect()
        } else {
            
            let queue = null
            let db_connection = null
            try {
                queue = await fetchQueueData(visitorId)
                console.log(`Accepting connection from ${visitorId}`)

                sockets[user.id] = socket
                users[visitorId] = user

                socket.on('disconnect', () => {
                    delete sockets[user.id]
                    delete users[visitorId]
                    
                    if (db_connection) {
                        db_connection.close();
                    }

                    console.log(`Disconnect from ${visitorId}`)
                })

                const subscribeToChanges = async (visitorId) => {
                    const queue = await fetchQueueData(visitorId)
                    db_connection = await r.connect(getConnectionOptions(config.rethinkdb))

                    socket.emit('QueuePosition', {queue: queue})
                    console.log(`Subscribing to changes on queue: ${queue.id}`)

                    r.db('gain').table('visitors').filter({'queue': queue.id}).changes().run(db_connection,
                        async (err, cursor) => {
                            if (err) {
                                console.log(err)
                                if (db_connection) 
                                    db_connection.close()
                                db_connection = await r.connect(getConnectionOptions(config.rethinkdb))
                                subscribeToChanges(visitorId)
                            }

                            cursor.each((queue) => {
                                console.log(`Change in queue ${queue.id} for ${visitorId}`);
                                fetchQueueData(visitorId).then(
                                    queue => {
                                        console.log(queue);
                                        socket.emit('QueuePosition', {queue: queue});
                                    }
                                )
                            })
                        }
                    )
                };

                subscribeToChanges(visitorId)

            } catch (err) {
                console.log(err)
                socket.disconnect()
            }
        }
    });

    return io
}