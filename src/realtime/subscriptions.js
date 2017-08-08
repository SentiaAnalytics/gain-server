const subscribers = new Map()

const logSubscriptions = () => {
  console.log(`Now serving ${subscribers.size} subscribers`)
}

export const subscribe = async (socket, subscriberObj, subscriptionId, connection, changefeed, what) => {
    if (!subscribers.has(socket.id)) {
        subscribers.set(socket.id, {
            socket,
            subscriber: subscriberObj,
            subscriptions: new Map()
        })
    }
    

    if (subscribers.get(socket.id).subscriptions.has(subscriptionId)) {
        throw `There is already a subscription named ${subscriptionId} for ${socket.id}` 
    }

    changefeed.run(
        connection,
        (error, cursor) => {
            if (error) {
                throw error
            }

            subscribers.get(socket.id).subscriptions.set(subscriptionId, {
                    connection,
                    cursor
                }
            )

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
            unsubscribe(socket, subscriptionId)
        }
    }
}

export const unsubscribe = (socket, subscriptionId) => {
    if (subscribers.has(socket.id)) {
        subscribers.get(socket.id).subscriptions.get(subscriptionId).cursor.close()
        subscribers.get(socket.id).subscriptions.get(subscriptionId).connection.close()
    }
}