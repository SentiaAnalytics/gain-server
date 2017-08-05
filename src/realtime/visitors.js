import SocketIO from 'socket.io'
import { fetchQueueData } from './visitors-queries'

let visitors = {}

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
          id: visitorId
        }

        visitors[socket.id] = visitor

        const result = await fetchQueueData(visitorId)

        visitors[socket.id]['queueId'] =result.data.public.visitor.queue.id

        socket.on('disconnect', () => {
          console.log(`Disconnect from ${socket.id}, visitorId: ${visitor.id}`)
          delete visitors[socket.id]
          console.log(`Now serving ${getVisitors().length} visitors`)
        })
        console.log(`Now serving ${getVisitors().length} visitors`)
      }
      catch (err) {
        console.log(`Error when accepting connection from ${socket.id}, visitorId: ${visitorId}: ${err}`)
        visitor.socket.disconnect()
        delete visitors[socket.id]
      }            
    }
  })

  setInterval(updateVisitors, 1000)

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

export default setupVisitorsSocket