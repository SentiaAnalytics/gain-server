import util from 'util'
const subscribers = new Map()

const logSubscriptions = () => {
    for (let subscriber of subscribers.keys()) {
        console.log(`Serving ${subscriber} with:`)
        for (let subscription of subscribers.get(subscriber).subscriptions.keys()) {
            console.log(subscription)
        }
    }
}

export const subscribe = async (socket, subscriberObj, subscriptionId, connection, changefeed, what) => {
    if (!subscribers.has(socket.id)) {
        console.log('Creating new subscriber')
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

            subscribers.get(socket.id).subscriptions.set(subscriptionId, {
                    connection,
                    cursor
                }
            )

            console.log(`Created subscription ${subscriptionId} on ${socket.id}`)

            cursor.each((data) => {
                what(data)
            })
        }
    )

    what()
}


export const unsubscribeAll = (socket) => {
    if (subscribers.has(socket.id)) {
        for (let subscriptionId of subscribers.get(socket.id).subscriptions.keys()) {
            unsubscribeNoLog(socket, subscriptionId)
        }
    }
    logSubscriptions()
}

const unsubscribeNoLog = (socket, subscriptionId) => {
    if (subscribers.has(socket.id)) {
        console.log(`Unsubscribing ${socket.id} from ${subscriptionId}`)
        subscribers.get(socket.id).subscriptions.get(subscriptionId).cursor.close()
        subscribers.get(socket.id).subscriptions.get(subscriptionId).connection.close()
        subscribers.get(socket.id).subscriptions.delete(subscriptionId)

        if (subscribers.get(socket.id).subscriptions.size == 0) {
            subscribers.delete(socket.id)
        }
    }
}

const unsubscribe = (socket, subscriptionId) => {
    unsubscribeNoLog(socket, subscriptionId)
    logSubscriptions()
}