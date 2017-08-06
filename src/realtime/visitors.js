import SocketIO from 'socket.io'
import { fetchQueueData } from './visitors-queries'
import getRethinkdbConnection from './rethinkdb'

const visitors = new Map()
const queueSubscriptions = new Map()

const subscribeToChanges = async (visitor) => {
  const { queueId } = visitor
  
  if (!queueSubscriptions.has(queueId)) {
    const rdbc = await getRethinkdbConnection()
    rdbc.table('visitors').filter({"queue": queueId}).changes().run(
      rdbc.connection,
      (err, cur) => {
        if (err) { 
          throw err
        }

        queueSubscriptions.set(queueId, {
          connection: rdbc.connection,
          cursor: cur,
          subscriberIds: new Set()
        })

        queueSubscriptions.get(queueId).subscriberIds.add(visitor.socket.id)
        logSubscriptions()

        cur.each((data) => {
          updateVisitors(queueId)
        })
      }
    )
  } else {
    queueSubscriptions.get(queueId).subscriberIds.add(visitor.socket.id)
    logSubscriptions()
  }
}

const unsubscribeFromChanges = (visitor) => {
  const { queueId } = visitor

  queueSubscriptions.get(queueId).subscriberIds.delete(visitor.socket.id)

  if (queueSubscriptions.get(queueId).subscriberIds.size === 0) {
    console.log(`Last visitor subscribed to queue ${queueId} unsubscribed. Closing rethinkDB connection.`)
    queueSubscriptions.get(queueId).cursor.close()
    queueSubscriptions.get(queueId).connection.close()
    queueSubscriptions.delete(queueId)
  }
}

const updateVisitors = async (queueId) => {
  if (!queueSubscriptions.has(queueId)) 
    return 

  const subscriberIds = queueSubscriptions.get(queueId).subscriberIds
  let socketId
  for (socketId of subscriberIds.keys()) {
    const visitor = visitors.get(socketId)
    const result = await fetchQueueData(visitor.id)
    visitor.socket.emit('UpdateVisitorMessage', result)
  }
}

const logSubscriptions = () => {
  console.log(`Now serving ${visitors.size} visitors`)
}

const setupVisitorsSocket = (server, path) => {
  console.log(`Setting up visitors socket server at ${path}`)

  const io = new SocketIO(server, {path: path});

  io.on('connection', async (socket) => {
    const visitorId = socket.handshake.query.visitorId
    
    if (!visitorId) {
      console.log(`Connection attempted by ${socket.id}: No visitorId in handshake -- disconnecting`)
      socket.disconnect()
    } else {
      console.log(`Connection from ${socket.id}, visitorId: ${visitorId}`)

      try {
        const visitor = {
          socket: socket,
          id: visitorId,
          queueId: null
        }

        visitors.set(socket.id, visitor)

        const result = await fetchQueueData(visitorId)

        visitors.get(socket.id).queueId = result.data.public.visitor.queue.id
        subscribeToChanges(visitors.get(socket.id))

        socket.on('disconnect', () => {
          console.log(`Disconnect from ${socket.id}, visitorId: ${visitor.id}`)
          unsubscribeFromChanges(visitor)
          visitors.delete(socket.id)
          logSubscriptions()
        })
      }
      catch (err) {
        console.log(`Error when accepting connection from ${socket.id}, visitorId: ${visitorId}: ${err}`)
        socket.disconnect()
        visitors.delete(socket.id)
      }            
    }
  })

  return io
}

export default setupVisitorsSocket