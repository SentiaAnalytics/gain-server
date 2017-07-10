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
                position
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
                return Promise.resolve(result.data.publicField)
            }
        })
}

let sockets = {};
let users = {};

export const setupQueueSocket = (server:Server) => {
    const io = new SocketIO(server);

    io.on('connection', (socket) => {
        const visitorId = socket.handshake.query.visitorId;
        const user = {
            id: socket.id,
            visitorId: visitorId
        };
        

        console.log(`Socket connection from ${visitorId}`);

        if (!visitorId) {
            console.log(`No visitorId supplied`);
            socket.disconnect();
        } else if (visitorId in users) {
            console.log(`Already have a connection from ${visitorId}`);
            socket.disconnect();
        } else {
            sockets[user.id] = socket;
            users[visitorId] = user;

            socket.on('disconnect', () => {
                delete sockets[user.id]
                delete users[visitorId]
            
                console.log(`Disconnect from ${visitorId}`)
            });

            let connection = null;

            r.connect(getConnectionOptions(config.rethinkdb))
                .then(conn => connection = conn)
                .catch(console.log)
            
            fetchQueueData(visitorId)
                .then(data => {
                    socket.emit('queue_info', data);
                    const queueId = data.visitor.queue.id;

                    r.db('gain').table('visitors').filter({'queue': queueId}).changes().run(connection,
                            (err, cursor) => {
                                cursor.each(() => {
                                    console.log(`Change in queue ${queueId}`);
                                    fetchQueueData(visitorId).then(
                                        data => {
                                            console.log(data);
                                            socket.emit('queue_info', data)
                                        }
                                    );
                                });
                            }
                        )
                })
                .catch(error => {
                    console.log(error);
                    if (connection) {
                        connection.close();
                    }
                    socket.disconnect();
                });
        }
    });

    return io
}