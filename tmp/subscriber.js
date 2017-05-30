const {Bus, RabbitMQAdapter} = require('./lib')

const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url}, adapter)
const subscriber = bus.subscriber('test')

bus.connect().then(() => {
  subscriber
    .onMessage((msg, content, ack) => {
      console.log(content)
      ack(msg)
    })
    .listen()
})
  .catch(error => console.error(error))
