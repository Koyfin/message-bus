import {Bus, RabbitMQAdapter} from '../../../src'
import * as Bluebird from 'bluebird'
import {expect} from 'chai'
import * as amqp from 'amqplib'

describe('subscriber', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  const adapter = new RabbitMQAdapter()
  const bus = new Bus({url, adapter})

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
        return _ch.assertQueue('test')
          .then(() => _ch.purgeQueue('test'))
      })
  })

  after('disconnect bus', function () {
    return bus.disconnect()
  })

  after('close amqp connection', function () {
    return conn.close()
  })

  it('subscriber should receive published msg', function (done) {
    const subscriber = bus.subscriber('test')
    const testContent = {test: 'val'}
    subscriber.onMessage((msg, content) => {
      expect(content).to.eql(testContent)
      bus.ack(msg)
      done()
    }).listen().then(() => {
      return ch.publish('', 'test', Buffer.from(JSON.stringify(testContent)))
    })

  })

})
