import SocketIO from 'socket.io'
import getRethinkdbConnection from './rethinkdb'
import { subscribe, unsubscribeAll } from './subscriptions'
import { fetchDealershipId, fetchDealershipQueues } from './users-queries'

const users = new Map()

const subscribeToQueues = async (user) => {
  const { socket, token } = user

  const result = await fetchDealershipQueues(token)
  const queueIds = result.data.session.dealership.queues.map(({id}) => id)
  const dealershipId = result.data.session.dealership.id
  
  const { connection, table } = await getRethinkdbConnection()
  const changefeed = table("visitors").filter({"dealership": dealershipId}).changes()
  const what = async (data) => {
    const result = await fetchDealershipQueues(token)
    socket.emit('UpdateQueuesMessage', result)
  }

  subscribe(socket, user, 'QUEUES', connection, changefeed, what)
}

const setupUsersSocketServer = (server, path) => {
  console.log(`Setting up users socket server at ${path}`)

  const io = new SocketIO(server, {path: path});

  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId
    const token = socket.handshake.query.token
    
    if (!userId) {
      console.log(`Connection attempted by ${socket.id}: No userId in handshake -- disconnecting`)
      socket.disconnect()
    } else if (!token) {
      console.log(`Connection attempted by ${socket.id}: No token in handshake -- disconnecting`)
      socket.disconnect()
    } {
      console.log(`Connection from ${socket.id}, userId: ${userId}`)

      try {
        const user = {
          socket: socket,
          id: userId,
          token,
          dealershipId: null
        }

        user.set(socket.id, user)

        const result = await fetchDealershipId(token)
        users.get(socket.id).dealershipId = result.data.session.user.dealership.id

        subscribeToQueues(token)
        
        socket.on('disconnect', () => {
          console.log(`Disconnect from ${socket.id}, visitorId: ${visitor.id}`)
          unsubscribeAll(socket)
          users.delete(socket.id)
        })
      }
      catch (err) {
        console.log(`Error when accepting connection from ${socket.id}, visitorId: ${visitorId}: ${err}`)
        socket.disconnect()
        unsubscribeAll(socket)
        users.delete(socket.id)
      }            
    }
  })

  return io
}

export default setupUsersSocketServer