#message-bus
Abstraction layer for message bus with pub-sub and RPC patterns implemented

##pub-sub example
```ecmascript 6
const {Bus, RabbitMQAdapter} = require('message-bus')

const key = 'somekey'
const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url, adapter})
const publisher = bus.publisher(key)
const subscriber = bus.subscriber(key)

subscriber.onMessage((msg, content) => {
  console.log(msg) // raw message
  console.log(content) // parsed message content
  bus.ack(msg)
})

bus.connect()
  .then(() => subscriber.listen())
  .then(() => {
    setInterval(() => publisher.publish({any: 'object'}), 2000)
  })
```

##req-res example
```ecmascript 6
const {Bus, RabbitMQAdapter} = require('message-bus')

const key = 'somekey'
const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url, adapter})
const requester = bus.requester(key)
const responder = bus.responder(key)

responder.onRequest((msg, content, respond) => {
  console.log('responding on ', content) // parsed message content
  respond(msg)
})

bus.connect()
  .then(() => responder.listen())
  .then(() => {
    setInterval(() => requester.request({any: 'object'}), 2000)
  })
```

##error handling
```ecmascript 6
bus.on('error', (error) => console.error('error'))
```
