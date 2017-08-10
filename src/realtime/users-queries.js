import { schema, root } from '../graphql'
import { graphql } from 'graphql'

const doQuery = query => {
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

export const fetchDealershipId = (token: string):Promise => {
  const query = 
  `query Q {
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
  `query {
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
            time_queued,
            time_served,
            served_by {
              id,
              email,
              forenames,
              lastname,
            },
            mobile,
            status,
            type,
            cpr,
            email,
            street,
            forenames,
            lastname,
            street,
            houseNumber,
            floor,
            apartment,
            postcode,
            city,
            country
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

export const fetchDealershipCars = (token: string):Promise => {
  const query = 
  `query FetchCars {
      session(token: "${token}") {
        dealership {
          cars {
            id,
            brand,
            model,
            licenseplate,
            disabled,
            time_created
          }
        }
      }
    }
  `

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