//@flow
import mysql from 'mysql'
import config from './config'

export type MySQLResult<T> = {
  data:T,
  fields:*
}

const conn = mysql.createPool(config.mysql)

export default <T>(query:string):Promise<MySQLResult<T>> =>
    new Promise((resolve, reject) =>
      conn.query(query, (err, data, fields) => {
        err ? reject(err) : resolve({data, fields})
      })
    )
