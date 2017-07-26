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
                    const result = await fetchQueueData(visitorId);
                    const queue = result.data.public.visitor.queue;
                    console.log(result);
                    console.log(queue);
                    db_connection = await r.connect(getConnectionOptions(config.rethinkdb))

                    socket.emit('UpdateVisitorMessage', result)
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

                            cursor.each(() => {
                                console.log(`Change in queue ${queue.id} for ${visitorId}`);
                                fetchQueueData(visitorId).then(
                                    result => {
                                        socket.emit('UpdateVisitorMessage', result);
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