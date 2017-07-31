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

                const handleChangeFeedError = async (v_id, q_id) => {
                    if (v_id in users) {
                        console.log(`RethinkDB changefeed connection error: ${v_id} in queue ${q_id} -- reconnecting`)
                        db_connection = await r.connect(getConnectionOptions(config.rethinkdb))
                        subscribeToChanges(v_id)
                    } else {
                        console.log(`RethinkDB changefeed connection for a disconnected visitor: ${v_id} in queue ${q_id} -- doing nothing`)
                    }
                };

                const subscribeToChanges = async (v_id) => {
                    const result = await fetchQueueData(v_id);
                    const queue = result.data.public.visitor.queue;
                    db_connection = await r.connect(getConnectionOptions(config.rethinkdb))

                    socket.emit('UpdateVisitorMessage', result)
                    console.log(`${v_id} subscribing to changes on queue ${queue.id}`)

                    r.db('gain').table('visitors').filter({'queue': queue.id}).changes().run(db_connection,
                        async (err, cursor) => {
                            if (err) {
                                handleChangeFeedError(v_id, queue.id)
                            } else cursor.each(async (err, row) => {
                                if (err) {
                                    handleChangeFeedError(v_id, queue.id)
                                } else {
                                    console.log(`Change in queue ${queue.id} for ${v_id}`);
                                    const res = await fetchQueueData(v_id);
                                    console.log(`Sending ${util.inspect(res, {showhHidden: false, depth:null})} to ${v_id}`)
                                    socket.emit('UpdateVisitorMessage', res);
                                }
                            })
                        }
                    )
                };

                subscribeToChanges(visitorId)

                socket.on('disconnect', () => {
                    console.log(`Disconnect from ${visitorId}`)
                    delete sockets[user.id]
                    delete users[visitorId]
                    
                    if (db_connection) {
                        db_connection.close();
                    }
                })

            } catch (err) {
                console.log(err)
                socket.disconnect()
            }
        }
    });

    return io
}