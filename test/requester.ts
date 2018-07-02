import { Bus } from '../src'
import * as Bluebird from 'bluebird'
import { expect } from 'chai'
import * as amqp from 'amqplib'

describe('requester', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  let bus: Bus
  let conn: amqp.Connection
  let ch: amqp.Channel
  // noinspection JSUnusedLocalSymbols
  let handler: any = (msg) => {
    throw new Error('not implemented!')
  }

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
        return ch.assertQueue('test')
          .then(() => ch.purgeQueue('test'))
          // echo responder
          .then(() => ch.consume('test', (msg) => handler(msg), {noAck: true}))
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
    const route = 'some route'

    handler = (msg) => {
      expect(msg.properties.type).to.eq(route)
      return ch.publish('', msg.properties.replyTo, msg.content, {correlationId: msg.properties.correlationId})
    }

    return requester
      .request(testContent, route)
      .then(({content}) => {
        expect(content).to.eql(testContent)
      })

  })

  it('responder should respond with request msg as buffer', function () {
    const requester = bus.requester('test')
    const testContent = {test: 'val'}
    const route = 'some route'

    handler = (msg) => {
      expect(msg.properties.type).to.eq(route)
      return ch.publish('', msg.properties.replyTo, msg.content, {correlationId: msg.properties.correlationId})
    }

    return requester
        .json(false)
        .request(Buffer.from(JSON.stringify(testContent)), route)
        .then(({content}) => {
          expect(JSON.parse(content.toString())).to.eql(testContent)
        })
  })

  it('two responders have to work correctly with json and buffer', async function () {
    const requester = bus.requester('test')
    const jsonRequester = bus.requester('test')
    const testContent = {test: 'val'}
    const jsonContent = {json: true}
    const route = 'some route'
    const jsonRoute = 'json route'

    handler = (msg) => {
      return ch.publish('', msg.properties.replyTo, msg.content, {correlationId: msg.properties.correlationId})
    }

    const {content} = await requester.json(false).request(Buffer.from(JSON.stringify(testContent)), route)
    expect(JSON.parse(content.toString())).to.eql(testContent)

    const jsonResponse = await jsonRequester.json(true).request(jsonContent, jsonRoute)
    expect(jsonResponse.content).to.eql(jsonContent)
  })

})
