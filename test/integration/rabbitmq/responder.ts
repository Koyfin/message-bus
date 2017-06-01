import {Bus, RabbitMQAdapter} from '../../../src'
import * as Bluebird from 'bluebird'
import {expect} from 'chai'
import * as amqp from 'amqplib'

describe('responder', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  const adapter = new RabbitMQAdapter()
  const bus = new Bus({url, adapter})
  const responderQueue = 'responderQueue'
  const requesterQueue = 'requesterQueue'

  let handler = (msg): any => {
    throw new Error('replace default handler!')
  }
  let ch: amqp.Channel
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
      .then(_ch => {
        ch = _ch
        return ch.assertQueue(requesterQueue)
          .then(() => ch.purgeQueue(requesterQueue))
          .then(() => ch.assertQueue(responderQueue))
          .then(() => ch.purgeQueue(responderQueue))
          .then(() => ch.consume(requesterQueue, (msg) => handler(msg)))
      })
  })

  after('disconnect bus', function () {
    return bus.disconnect()
  })

  after('close amqp connection', function () {
    return conn.close()
  })

  it('responder should respond with request msg', function (done) {
    const replyTo = requesterQueue
    const correlationId = 'correlationId'
    const testContent = {test: 'val'}
    const responder = bus.responder(responderQueue)

    handler = (msg) => {
      const content = JSON.parse(msg.content.toString())
      expect(content).eql(testContent)
      done()
    }

    responder.onRequest((msg, content, respond) => {
      respond(content)
    }).listen().then(() => {
      return ch.publish('', responderQueue, Buffer.from(JSON.stringify(testContent)), {
        replyTo,
        correlationId,
      })
    })

  })

})
