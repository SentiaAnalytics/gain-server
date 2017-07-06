//@flow

import { schema, root } from './graphql'
import { graphql } from 'graphql'

export const getQueueInfo = (visitorId: string):Promise<string> => {
    const visitorQuery = `
    query {
        publicField {
            visitor(id: "${visitorId}") {
                mobile
                time
                dealership {
                    name
                }
                queue {
                    name
                    position
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