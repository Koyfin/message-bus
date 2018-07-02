import * as uuid from 'uuid'
import * as amqplib from 'amqplib'
import { EventEmitter } from 'events'
import { BusWorker, IBusWorkerOptions } from './types'
import { Events } from './events'
// this import is needed for proper compilation
// noinspection ES6UnusedImports
import { Replies } from 'amqplib'
import { Options } from 'amqplib/properties'

export class RabbitMQWorker implements BusWorker {

  private static REPLY_QUEUE = 'amq.rabbitmq.reply-to'

  private connection: amqplib.Connection
  private _channel: amqplib.Channel
  private url: string
  private responseEmitter: NodeJS.EventEmitter

  private static getMessageContent (msg) {
    return JSON.parse(msg.content.toString())
  }

  async connect (url, options: IBusWorkerOptions) {
    this.url = url
    //noinspection TsLint
    this.connection = await amqplib.connect(this.url)
    if (options.channelType === 'regular') {
      this._channel = await this.connection.createChannel()
    } else if (options.channelType === 'confirm') {
      this._channel = await this.connection.createConfirmChannel()
    } else {
      throw new Error(`unsupported channelType option '${options.channelType}' provided`)
    }
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

  async publish (key, exchange, message, options?: Options.Publish, toJson = true ) {
    if (!key && !exchange) {
      throw new Error(`please specify key or exchange. key="${key}" exchange="${exchange}"`)
    }
    const content = toJson ? Buffer.from(JSON.stringify(message)) : message
    return this._channel.publish(exchange, key, content, options)
  }

  async subscribe (queue, eventEmitter: NodeJS.EventEmitter, noAck, json?: boolean) {
    const options = {noAck}
    const {consumerTag} = await this._channel.consume(queue, (message) => {
      try {
        const content = json ? RabbitMQWorker.getMessageContent(message) : message.content
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
    const {key, exchange, timeout, route, message, json} = options
    if (!key && !exchange) {
      return Promise.reject(`please specify key or exchange. key="${key}" exchange="${exchange}"`)
    }
    return new Promise((resolve, reject) => {
      const correlationId = uuid.v4()
      const timeoutId = setTimeout(() => {
        this.responseEmitter.removeAllListeners(correlationId)
        reject(new Error(`RPC response timeout, ${timeout} ms`))
      }, timeout)

      this.responseEmitter.once(correlationId, (msg) => {
        clearTimeout(timeoutId)
        const content = json ? RabbitMQWorker.getMessageContent(msg) : msg.content
        return resolve({msg, content})
      })

      const data = json ? Buffer.from(JSON.stringify(message)) : message
      this._channel.publish(exchange, key, data, {
        correlationId,
        replyTo: RabbitMQWorker.REPLY_QUEUE,
        type: route,
      })
    })
  }

  async respond (res, msg, json) {
    const {replyTo, correlationId} = msg.properties
    const data = json ? Buffer.from(JSON.stringify(res)) : res
    return this._channel.publish('', replyTo, data, {correlationId})
  }

  private async setupReplyQueue () {
    this.responseEmitter = new EventEmitter()
    this.responseEmitter.setMaxListeners(0)
    return this._channel.consume(RabbitMQWorker.REPLY_QUEUE,
      (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg),
      {noAck: true})
  }

}
