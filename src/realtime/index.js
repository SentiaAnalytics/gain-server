import setupVisitorsSocket from './visitors'
import setupUsersSocketServer from './users'

export const setupSockets = (app, server) => {
  const ws_path = '/ws'
  setupVisitorsSocket(app, server, `${ws_path}/visitors`)
  setupUsersSocketServer(app, server, `${ws_path}/users`)
}