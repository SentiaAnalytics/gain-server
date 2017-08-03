import r from 'rethinkdb'
import { parse } from 'url'
import config from '../config'

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

const rethinkConnection = () => {
  console.log(`Establising connection to rethinkDB`)
  
  const config = getConnectionOptions(config.rethinkdb)
  let connection = null

  r.connect(config, (error, conn) => {
    if (error) throw error
    connection = conn
  })

  return connection.db(config.db)
}