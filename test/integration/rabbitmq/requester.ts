import {Bus, RabbitMQAdapter} from '../../../src'
import * as Bluebird from 'bluebird'
import {expect} from 'chai'
import * as amqp from 'amqplib'

describe('requester', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  const adapter = new RabbitMQAdapter()
  const bus = new Bus({url}, adapter)

  let conn: amqp.Connection

  before('wait bus ready', function () {
    function connect () {
      return bus.connect()
        .catch(() => {
          return Bluebird.delay(1000).then(connect)
        })
    }

    return connect()
  })

  before('prepare amqp', function () {
    return amqp.connect(url)
      .then(_conn => {
        conn = _conn
        return conn.createChannel()
      })
      .then(ch => {
        return ch.assertQueue('test')
          .then(() => ch.purgeQueue('test'))
          // echo responder
          .then(() => ch.consume('test', (msg) => {
            return ch.publish('', msg.properties.replyTo, msg.content, {correlationId: msg.properties.correlationId})
          }, {noAck: true}))
      })
  })

  after('disconnect bus', function () {
    return bus.disconnect()
  })

  after('close amqp connection', function () {
    return conn.close()
  })

  it('responder should respond with request msg', function () {
    const requester = bus.requester('test')
    const testContent = {test: 'val'}

    return requester
      .request(testContent)
      .then(({msg, content}) => {
        expect(content).to.eql(testContent)
      })

  })

})
