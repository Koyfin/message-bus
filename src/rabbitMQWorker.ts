import * as uuid from 'uuid'
import * as amqplib from 'amqplib'
import { EventEmitter } from 'events'
import { BusWorker } from './types'
import { Events } from './events'
// this import is needed for proper compilation
// noinspection ES6UnusedImports
import { Replies } from 'amqplib'

export class RabbitMQWorker implements BusWorker {

  private static REPLY_QUEUE = 'amq.rabbitmq.reply-to'

  private connection: amqplib.Connection
  private _channel: amqplib.Channel
  private url: string
  private responseEmitter: NodeJS.EventEmitter

  private static getMessageContent (msg) {
    return JSON.parse(msg.content.toString())
  }

  async connect (url: string) {
    this.url = url
    //noinspection TsLint
    this.connection = await amqplib.connect(this.url)
    this._channel = await this.connection.createChannel()
    await this.setupReplyQueue()
  }

  async disconnect () {
    await this.connection.close()
  }

  async configure (cb: (channel: amqplib.Channel) => Promise<any>) {
    await cb(this._channel)
  }

  channel () {
    return this._channel
  }

  async publish (key, exchange, message) {
    if (!key && !exchange) {
      throw new Error(`please specify key or exchange. key="${key}" exchange="${exchange}"`)
    }
    const content = Buffer.from(JSON.stringify(message))
    return this._channel.publish(exchange, key, content)
  }

  async subscribe (queue, eventEmitter: NodeJS.EventEmitter, noAck) {
    const options = {noAck}
    const {consumerTag} = await this._channel.consume(queue, (message) => {
      try {
        const content = RabbitMQWorker.getMessageContent(message)
        eventEmitter.emit(Events.MESSAGE, message, content)
      } catch (error) {
        eventEmitter.emit(Events.ERROR, error, message)
      }
    }, options)
    return consumerTag
  }

  async unsubscribe (consumerTag: string) {
    await this._channel.cancel(consumerTag)
  }

  ack (msg) {
    return this._channel.ack(msg)
  }

  nack (msg, allUpTo, requeue) {
    return this._channel.nack(msg, allUpTo, requeue)
  }

  request (options) {
    const {key, exchange, timeout, route, message} = options
    if (!key && !exchange) {
      return Promise.reject(`please specify key or exchange. key="${key}" exchange="${exchange}"`)
    }
    return new Promise((resolve, reject) => {
      const correlationId = uuid.v4()
      const timeoutId = setTimeout(() => {
        this.responseEmitter.removeAllListeners(correlationId)
        reject(new Error('todo: timeout'))
      }, timeout)

      this.responseEmitter.once(correlationId, (msg) => {
        clearTimeout(timeoutId)
        const content = RabbitMQWorker.getMessageContent(msg)
        return resolve({msg, content})
      })

      this._channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: RabbitMQWorker.REPLY_QUEUE,
        type: route,
      })
    })
  }

  async respond (res, msg) {
    const {replyTo, correlationId} = msg.properties
    return this._channel.publish('', replyTo, Buffer.from(JSON.stringify(res)), {correlationId})
  }

  private async setupReplyQueue () {
    this.responseEmitter = new EventEmitter()
    this.responseEmitter.setMaxListeners(0)
    return this._channel.consume(RabbitMQWorker.REPLY_QUEUE,
      (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg),
      {noAck: true})
  }

}
