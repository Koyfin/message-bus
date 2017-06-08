# message-bus
Abstraction layer for message bus with pub-sub and RPC patterns implemented

## pub-sub example
```javascript
const {Bus, RabbitMQAdapter, Events} = require('message-bus')

const key = 'somekey'
const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url, adapter})
const publisher = bus.publisher(key)
const subscriber = bus.subscriber(key)

subscriber
    .on(Events.MESSAGE, (msg, content) => {
      console.log(msg) // raw message
      console.log(content) // parsed message content
      bus.ack(msg)
    })
    .on(Events.ERROR, error => console.error(error))

bus.connect()
  .then(() => subscriber.subscribe())
  .then(() => {
    setInterval(() => publisher.publish({any: 'object'}), 2000)
  })
```

## req-res example
```javascript
const {Bus, RabbitMQAdapter} = require('message-bus')

const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url, adapter})
const requester = bus.requester('somekey')
const responder = bus.responder('somekey')

responder
    .on(Events.REQUEST, (msg, content, respond) => {
      console.log('responding on ', content) // parsed message content
      return respond(msg)
    })
    .on(Events.ERROR, error => console.error(error))
    
bus.connect()
  .then(() => responder.subscribe())
  .then(() => {
    setInterval(() => requester.request({any: 'object'}), 2000)
  })
```

## bus configuration
```javascript
bus.configure((channel) => {
  // channel is an instance of amqplib.Channel
  return Promise.resolve()
})
```