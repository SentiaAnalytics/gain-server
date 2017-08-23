import SocketIO from 'socket.io'
import r from 'rethinkdb'
import { subscribe, unsubscribeAll } from './subscriptions'
import { fetchDealershipId, fetchDealershipQueues, fetchDealershipCars } from './users-queries'
import util from 'util'

const users = new Map()

const subscribeToQueues = (user) => {
  const { socket, token, dealershipId } = user
 
  const changefeed = r.table("visitors").filter({"dealership": dealershipId}).changes()

  const what = (data) => {
    fetchDealershipQueues(token).then((result) => {
      socket.emit('UpdateQueuesMessage', result)
    })
  }

  subscribe(socket, user, 'QUEUES', changefeed, what)
}

const subscribeToCars = (user) => {
  const { socket, token, dealershipId } = user

  const changefeed = r.table("cars").filter({"dealership": dealershipId}).changes()

  const what = (data) => {
    fetchDealershipCars(token).then((result) => {
      socket.emit('UpdateCarsMessage', result)
    })
  }

  subscribe(socket, user, 'CARS', changefeed, what)
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

        users.set(socket.id, user)

        const result = await fetchDealershipId(token)
        users.get(socket.id).dealershipId = result.data.session.user.dealership.id
        subscribeToQueues(user)
        subscribeToCars(user)
        
        socket.on('disconnect', () => {
          console.log(`Disconnect from ${socket.id}, userId: ${user.id}`)
          unsubscribeAll(socket)
          users.delete(socket.id)
        })
      }
      catch (err) {
        console.log(`Error when accepting connection from ${socket.id}, userId: ${userId}: ${util.inspect(err, {depth: null})}`)
        socket.disconnect()
        unsubscribeAll(socket)
        users.delete(socket.id)
      }            
    }
  })

  return io
}

export default setupUsersSocketServer