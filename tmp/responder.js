const {Bus, RabbitMQAdapter} = require('./lib')
const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url}, adapter)
const responder = bus.responder('test')

bus.connect().then(() => {
  responder
    .onRequest((msg, respond) => {
      respond(msg)
    })
    .onError((error) => {
      console.error(error)
    })
    .listen()
})

bus.on('error', (error) => console.warn(error))
