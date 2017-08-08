import { schema, root } from '../graphql'
import { graphql } from 'graphql'

export const fetchDealershipId = (token: string):Promise => {
  const query = 
  `query UserID {
    session(token: "${token}") {
      user {
        id
        dealership {
          id
        }
      }
    }
  }`

  return graphql(schema, query, root)
    .then(result => {
      if (result.errors) {
        return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
      } else {
        return Promise.resolve(result)
      }
    }
  )
}

export const fetchDealershipQueues = (token: string):Promise => {
  const query = 
  `query DealershipQueues {
    session(token: "${token}") {
      dealership {
        queues {
          id, 
          name, 
          description,
          order,
          currentVisitors {
            id,
            name,
            mobile,
            type,
            time_queued,
            time_served,
            served_by {
              id,
              email,
              forenames,
              lastname

            },
            status,
          }
        }
      }
    }
  }`

  return graphql(schema, query, root)
    .then(result => {
      if (result.errors) {
        return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
      } else {
        return Promise.resolve(result)
      }
    }
  )
}