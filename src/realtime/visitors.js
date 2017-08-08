import SocketIO from 'socket.io'
import { subscribe, unsubscribeAll } from './subscriptions'
import { fetchQueueData } from './visitors-queries'
import getRethinkdbConnection from './rethinkdb'

const visitors = new Map()

const subscribeToQueueChanges = async (visitor) => {
  const { queueId, socket } = visitor

  const { connection, table } = await getRethinkdbConnection()
  const changefeed = table("visitors").filter({"queue": queueId}).changes()
  const what = async (data) => {
    const result = await fetchQueueData(visitor.id)
    socket.emit('UpdateVisitorMessage', result)
  }

  subscribe(socket, visitor, 'VISITOR', connection, changefeed, what)
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
        
        subscribeToQueueChanges(visitors.get(socket.id))

        socket.on('disconnect', () => {
          console.log(`Disconnect from ${socket.id}, visitorId: ${visitor.id}`)
          unsubscribeAll(socket)
          visitors.delete(socket.id)
        })
      }
      catch (err) {
        console.log(`Error when accepting connection from ${socket.id}, visitorId: ${visitorId}: ${err}`)
        socket.disconnect()
        unsubscribeAll(socket)
        visitors.delete(socket.id)
      }            
    }
  })

  return io
}

export default setupVisitorsSocket