import { Bus, Events } from '../src'
import * as Bluebird from 'bluebird'
import { expect } from 'chai'
import * as amqp from 'amqplib'
import ResponderBuilder from '../src/responderBuilder'

describe('responder', function () {

  const url = process.env.BUS_URL || 'amqp://localhost:5672'
  const responderQueue = 'responderQueue'
  const requesterQueue = 'requesterQueue'
  let bus: Bus

  let defaultHandler = (): any => {
    throw new Error('replace default handler!')
  }
  let handler: (msg) => any
  let responder: ResponderBuilder
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

  beforeEach('assign default handler', function () {
    handler = defaultHandler
  })

  afterEach('unsubscribe', function () {
    return responder.unsubscribe()
  })

  it('responder should respond with request msg', function (done) {
    const replyTo = requesterQueue
    const correlationId = 'correlationId'
    const testContent = {test: 'val'}
    const route = 'some-route'
    responder = bus.responder(responderQueue)

    handler = (msg) => {
      const content = JSON.parse(msg.content.toString())
      expect(content).eql(testContent)
      done()
    }

    responder
      .on(route, (msg, content, respond) => {
        return respond(content)
      })
      .subscribe()
      .then(() => {
        return ch.publish('', responderQueue, Buffer.from(JSON.stringify(testContent)), {
          replyTo,
          correlationId,
          type: route,
        })
      })

  })

  it('responder should respond with request msg as buffer', function (done) {
    const replyTo = requesterQueue
    const correlationId = 'correlationId'
    const testContent = {test: 'val'}
    const route = 'some-route'
    responder = bus.responder(responderQueue)

    handler = (msg) => {
      const content = JSON.parse(msg.content.toString())
      expect(content).eql(testContent)
      done()
    }

    responder
        .json(false)
        .on(route, (msg, content, respond) => {
          return respond(msg.content)
        })
        .subscribe()
        .then(() => {
          return ch.publish('', responderQueue, Buffer.from(JSON.stringify(testContent)), {
            replyTo,
            correlationId,
            type: route,
          })
        })
  })

  it('responder should respond with "" route', function (done) {
    const replyTo = requesterQueue
    const correlationId = 'correlationId'
    const testContent = {test: 'val'}
    const route = ''
    responder = bus.responder(responderQueue)

    handler = (msg) => {
      const content = JSON.parse(msg.content.toString())
      expect(content).eql(testContent)
      done()
    }

    responder
      .on(route, (msg, content, respond) => {
        return respond(content)
      })
      .subscribe()
      .then(() => {
        return ch.publish('', responderQueue, Buffer.from(JSON.stringify(testContent)), {
          replyTo,
          correlationId,
          type: route,
        })
      })

  })

  it('responder should respond with Events.ROUTE_NOT_FOUND if route not found', function (done) {
    const replyTo = requesterQueue
    const correlationId = 'correlationId'
    const requestContent = {some: 'val'}
    const responseContent = {error: 'not found'}
    const route = 'some route'
    responder = bus.responder(responderQueue)

    handler = (msg) => {
      const content = JSON.parse(msg.content.toString())
      expect(content).eql(responseContent)
      done()
    }

    responder
      .on(Events.ROUTE_NOT_FOUND, (msg, content, respond) => {
        return respond(responseContent)
      })
      .subscribe()
      .then(() => {
        return ch.publish('', responderQueue, Buffer.from(JSON.stringify(requestContent)), {
          replyTo,
          correlationId,
          type: route,
        })
      })

  })

  it('responder should emit error event with message if invalid message received', function (done) {
    const content = 'invalid json'
    responder = bus.responder(responderQueue)
    responder
      .on(Events.ERROR, (error, message, respond) => {
        expect(error instanceof Error).to.eq(true)
        expect(message.content.toString()).to.eq(content)
        expect(typeof respond).to.eq('function')
        done()
      })
      .subscribe()
      .then(() => ch.publish('', responderQueue, Buffer.from(content)))
      .catch(done)
  })

  it('responder should emit error event with message if there was an error in handler', function (done) {
    const content = {some: 'val'}
    responder = bus.responder(responderQueue)
    responder
      .on(Events.ROUTE_DEFAULT, () => {
        throw new Error('test error')
      })
      .on(Events.ERROR, (error, message, respond) => {
        expect(error instanceof Error).to.eq(true)
        expect(JSON.parse(message.content.toString())).to.eql(content)
        expect(typeof respond).to.eq('function')
        done()
      })
      .subscribe()
      .then(() => ch.publish('', responderQueue, Buffer.from(JSON.stringify(content))))
      .catch(done)
  })

  it('responder should emit error event with message if there was an async error in handler', function (done) {
    const content = {some: 'val'}
    responder = bus.responder(responderQueue)
    responder
      .on(Events.ROUTE_DEFAULT, async () => {
        // await Promise.resolve()
        throw new Error('test error')
      })
      .on(Events.ERROR, (error, message, respond) => {
        expect(error instanceof Error).to.eq(true)
        expect(JSON.parse(message.content.toString())).to.eql(content)
        expect(typeof respond).to.eq('function')
        done()
      })
      .subscribe()
      .then(() => ch.publish('', responderQueue, Buffer.from(JSON.stringify(content))))
      .catch(done)
  })
})
