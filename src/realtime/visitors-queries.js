import { schema, root } from '../graphql'
import { graphql } from 'graphql'

export const fetchQueueData = (visitorId: string):Promise => {
  const visitorQuery = 
  `query {
    public {
      visitor(id: "${visitorId}") {
        id
        mobile
        position
        status
        name
        queue {
          id
          name
          description
        }
        served_by {
          id
          email
          forenames
          lastname
        }
      }
    }
  }`

  return graphql(schema, visitorQuery, root)
    .then(result => {
      if (result.errors) {
        return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
      } else {
        return Promise.resolve(result)
      }
    }
  )
}