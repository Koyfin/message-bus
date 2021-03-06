import { Bus } from '../src'
import * as Bluebird from 'bluebird'
import { expect } from 'chai'
import * as amqp from 'amqplib'

describe('publisher', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  const queue = 'test'
  let bus: Bus

  // noinspection JSUnusedLocalSymbols
  let handler = (msg): any => {
    throw new Error('replace default handler!')
  }
  let ch: amqp.Channel
  let conn: amqp.Connection

  before('wait bus ready', function () {
    function connect () {
      return Bus.connect(url)
        .then(_bus => {
          bus = _bus
        })
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
        return _ch.assertExchange('fanout', 'fanout')
      })
      .then(() => ch.assertExchange('direct', 'direct'))
      .then(() => ch.assertQueue(queue))
      .then(() => ch.purgeQueue(queue))
      .then(() => ch.bindQueue(queue, 'fanout', ''))
      .then(() => ch.bindQueue(queue, 'direct', 'direct'))
      .then(() => ch.consume(queue, (msg) => handler(msg), {noAck: true}))
  })

  after('disconnect bus', function () {
    return bus.disconnect()
  })

  after('close amqp connection', function () {
    return conn.close()
  })

  beforeEach('purge queue', function () {
    return ch.purgeQueue(queue)
  })

  it(`publisher should publish msg to default exchange with "${queue}" key`, function (done) {
    const testContent = {test: 'default exchange'}
    const publisher = bus.publisher(queue, '')
    handler = (msg) => {
      expect(JSON.parse(msg.content.toString())).eql(testContent)
      done()
    }
    publisher.publish(testContent)
      .catch(done)

  })

  it(`publisher should publish msg to fanout exchange with "" key`, function (done) {
    const testContent = {test: 'fanout exchange'}
    const publisher = bus.publisher('', 'fanout')
    handler = (msg) => {
      expect(JSON.parse(msg.content.toString())).eql(testContent)
      done()
    }
    publisher.publish(testContent)
      .catch(done)

  })

  it(`publisher should publish msg to direct exchange with "direct" key`, function (done) {
    const testContent = {test: 'direct exchange'}
    const publisher = bus.publisher('direct', 'direct')
    handler = (msg) => {
      expect(JSON.parse(msg.content.toString())).eql(testContent)
      done()
    }
    publisher.publish(testContent)
      .catch(done)

  })

  it(`publisher should publish msg without convertation to JSON`, function (done) {
    const testContent = {test: 'buffer'}
    const publisher = bus.publisher('direct', 'direct')
    handler = (msg) => {
      expect(msg.content).eql(Buffer.from(JSON.stringify(testContent)))
      done()
    }
    publisher.json(false).publish(Buffer.from(JSON.stringify(testContent)))
        .catch(done)

  })

})
