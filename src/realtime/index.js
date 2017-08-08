import setupVisitorsSocket from './visitors'
import setupUsersSocketServer from './users'

export const setupSockets = (server) => {
  const ws_path = '/ws'
  setupVisitorsSocket(server, `${ws_path}/visitors`)
  setupUsersSocketServer(server, `${ws_path}/users`)
}