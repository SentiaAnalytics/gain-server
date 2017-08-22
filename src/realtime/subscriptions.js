import util from 'util'
import { rethinkConnection } from './rethinkdb'

const subscribers = new Map()

export const logSubscriptions = () => {
    for (let subscriber of subscribers.keys()) {
        console.log(`Serving ${subscriber} with:`)
        for (let subscription of subscribers.get(subscriber).subscriptions.keys()) {
            console.log(subscription)
        }
    }
}

export const subscribe = async (socket, subscriberObj, subscriptionId, changefeed, what) => {
    const connection = await rethinkConnection()
    
    if (!subscribers.has(socket.id)) {
        console.log(`Creating new subscriber ${subscriberObj.id} for ${socket.id}`)
        subscribers.set(socket.id, {
            subscriber: subscriberObj,
            subscriptions: new Map()
        })
    }

    changefeed.run(
        connection,
        (error, cursor) => {
            if (error) {
                throw error
            }

            if (subscribers.get(socket.id).subscriptions.has(subscriptionId)) {
                throw `There is already a subscription named ${subscriptionId} for ${socket.id}` 
            }

            const subscriptionData = {
                connection, 
                cursor, 
                shuttingDown: false
            }

            subscribers.get(socket.id).subscriptions.set(subscriptionId, subscriptionData)

            connection.once('close', () => {
                if (!subscriptionData.shuttingDown) {
                    console.log(`RethinkDB connection was unintentionally closed in ${subscriptionId} for ${socket.id}`)
                    unsubscribe(socket, subscriptionId)
                    subscribe(socket, subscriberObj, subscriptionId, changefeed, what)    
                }
            })

            console.log(`Created subscription ${subscriptionId} for ${socket.id}`)

            cursor.each((data) => {
                console.log(`Update in ${subscriptionId} for ${socket.id}`)
                what(data)
            })
        }
    )

    what()
}

const unsubscribe = (socket, subscriptionId) => {
    console.log(`Unsubscribing ${subscriptionId} for ${socket.id}`)
    const subscription = subscribers.get(socket.id).subscriptions.get(subscriptionId)
    
    subscription.cursor.close()
    subscription.connection.close()        
    subscribers.get(socket.id).subscriptions.delete(subscriptionId)

    if (subscribers.get(socket.id).subscriptions.size == 0) {
        console.log(`Removed final subscription for ${socket.id}`)
        subscribers.delete(socket.id)
    }
}

const markForShutDownAndUnsubscribe = (socket, subscriptionId) => {
    subscribers.get(socket.id).subscriptions.get(subscriptionId).shuttingDown = true
    unsubscribe(socket, subscriptionId)
}

const unsubscribeAll = (socket) => {
    if (subscribers.has(socket.id)) {
        for (let subscriptionId of subscribers.get(socket.id).subscriptions.keys()) {
            markForShutDownAndUnsubscribe(socket, subscriptionId)
        }
    }
}

export { markForShutDownAndUnsubscribe as unsubscribe, unsubscribeAll }