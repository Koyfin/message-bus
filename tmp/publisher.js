const {Bus, RabbitMQAdapter} = require('./lib')

const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url}, adapter)
const publisher = bus.publisher('test')

bus.connect().then(() => {
  setInterval(() => {
    publisher.publish({test: 'val'})
  }, 1000)
})
