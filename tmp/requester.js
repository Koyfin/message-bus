const {Bus, RabbitMQAdapter} = require('./lib')

const url = 'amqp://localhost'
const adapter = new RabbitMQAdapter()
const bus = new Bus({url}, adapter)
const requester = bus.requester('test')

bus.connect().then(() => {
  setInterval(() => {
    requester
      .request({test: 'val'})
      .then(({msg, content}) => {
        console.log(content)
      })
      .catch(error => console.error(error))
  }, 1000)
})
  .catch(error => console.error(error))
