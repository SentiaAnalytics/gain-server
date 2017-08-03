import SocketIO from 'socket.io'

let visitors = {}

const setupVisitorsSocket = (app, server, path) => {
  console.log(`Setting up visitors socket server at ${path}`)

  app.use(path, function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  const io = new SocketIO(server, {path: path});
  console.log(io)

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