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

export const subscribe = (id, subscriberObj, subscriptionId, connection, changefeed, what) => {
    if (!subscribers.has(id)) {
        console.log(`Creating new subscriber ${id}`)
        subscribers.set(id, {
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

            if (subscribers.get(id).subscriptions.has(subscriptionId)) {
                throw `There is already a subscription named ${subscriptionId} for ${id}` 
            }

            subscribers.get(id).subscriptions.set(subscriptionId, {
                    connection,
                    cursor,
                    timer: setInterval(what, 2000)
                }
            )

            console.log(`Created subscription ${subscriptionId} on ${id}`)

            cursor.each((data) => {
                console.log(`Update in ${subscriptionId} for ${id}`)
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
        const subscription = subscribers.get(socket.id).subscriptions.get(subscriptionId)
        
        subscription.cursor.close()
        subscription.connection.close()
        clearInterval(subscription.timer)
        
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