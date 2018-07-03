# message-bus
Abstraction layer for message bus with pub-sub and RPC patterns implemented

## pub-sub example
```javascript
const {Bus, Events} = require('message-bus')

const key = 'somekey'
const url = 'amqp://localhost'

Bus.connect(url)
.then((bus) => {
  const publisher = bus.publisher(key)
  const subscriber = bus.subscriber(key)

  subscriber
    .on(Events.MESSAGE, (msg, content) => {
      // console.log(msg) // raw message
      console.log(content) // parsed message content
      bus.ack(msg)
    })
    .on(Events.ERROR, (error, msg) => {
      console.error(error)
      bus.nack(msg, allUpTo, requeue) // bus.ack(msg)
    })
      
    subscriber.subscribe()
    .then(() => {
      setInterval(() => publisher.publish({any: 'object'}), 2000)
    })
})
```

## req-res example
```javascript
const {Bus, Events} = require('message-bus')

const url = 'amqp://localhost'
   
Bus.connect(url)
.then((bus) => {
  const route = 'optional route'
  const requester = bus.requester('somekey', route)
  const responder = bus.responder('somekey', route)

  responder
    .on(route, (msg, content, respond) => {
      console.log('responding on ', content) // parsed message content
      return respond(msg, {headers: {statusCode: 200}}) // respond with optional msg properties
    })
    // if route not specified
    .on(Events.ROUTE_DEFAULT, (msg, content, respond) => {
      console.log('responding on ', content) // parsed message content
      return respond(msg, {headers: {statusCode: 200}}) // respond with optional msg properties
    })
    // fallback, if no handlers found for given route
    .on(Events.ROUTE_NOT_FOUND, (msg, content, respond) => {
      console.log('responding on ', content) // parsed message content
      return respond(msg, {headers: {statusCode: 200}}) // respond with optional msg properties
    })
    .on(Events.ERROR, error => console.error(error))
    
    responder.subscribe()
    .then(() => {
      setInterval(() => requester.request({any: 'object'}), 2000)
    })
})
```

## bus configuration
```javascript
bus.configure((channel) => {
  // channel is an instance of amqplib.Channel
  return Promise.resolve()
})
```
