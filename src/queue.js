//@flow

import { schema, root } from './graphql'
import { graphql } from 'graphql'

export const getQueueInfo = (visitorId: string):Promise<string> => {
    const visitorQuery = `
    query {
        publicField {
            visitor(id: "${visitorId}") {
                id
                mobile
                time
                dealership {
                    id
                    name
                }
                queue {
                    id
                    name
                }
            }
        }
    }`
    return graphql(schema, visitorQuery, root)
        .then(result => {
            if (result.errors) {
                return Promise.reject('Errors: ' + result.errors.map(({message}) => message))
            } else {
                return Promise.resolve(result.data.publicField.visitor)
            }
        })
}