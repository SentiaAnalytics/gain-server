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

const getRethinkdbConnection = async () => {
  console.log(`Establising connection to rethinkDB`)
  
  const conOpts = getConnectionOptions(config.rethinkdb)
  const c = await r.connect(conOpts, (error, conn) => {
    if (error) {
      throw error
    }
    return conn
  })

  return {
    table: (tablename) => {
      return r.db(conOpts.db).table(tablename)
    },
    connection: c
  }
}

export default getRethinkdbConnection