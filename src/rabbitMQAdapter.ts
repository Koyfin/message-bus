import * as uuid from 'uuid'
import * as amqplib from 'amqplib'
import {EventEmitter} from 'events'
import {Adapter} from './types'
import {Events} from './events'
import {Replies} from '@types/amqplib'

interface RabbitMQOptions {
  url: string
}

export class RabbitMQAdapter implements Adapter {

  private static REPLY_QUEUE = 'amq.rabbitmq.reply-to'

  private connection: amqplib.Connection
  private channel: amqplib.Channel
  private options: RabbitMQOptions
  private responseEmitter: NodeJS.EventEmitter

  private static getMessageContent (msg) {
    return JSON.parse(msg.content.toString())
  }

  async connect (options) {
    this.options = options
    //noinspection TsLint
    this.connection = await amqplib.connect(this.options.url)
    this.channel = await this.connection.createChannel()
    await this.setupReplyQueue()
  }

  async disconnect () {
    await this.connection.close()
  }

  async publish (key, exchange, message) {
    if (!key && !exchange) {
      throw new Error(`please specify key or exchange. key="${key}" exchange="${exchange}"`)
    }
    const content = Buffer.from(JSON.stringify(message))
    return this.channel.publish(exchange, key, content)
  }

  async subscribe (queue, eventEmitter: NodeJS.EventEmitter, noAck) {
    const options = {noAck}
    const {consumerTag} = await this.channel.consume(queue, (message) => {
      try {
        const content = RabbitMQAdapter.getMessageContent(message)
        eventEmitter.emit(Events.MESSAGE, message, content)
      } catch (error) {
        this.nack(message)
        eventEmitter.emit(Events.ERROR, error)
      }
    }, options)
    return consumerTag
  }

  async unsubscribe (consumerTag: string) {
    await this.channel.cancel(consumerTag)
  }

  ack (msg) {
    return this.channel.ack(msg)
  }

  nack (msg) {
    return this.channel.nack(msg, false, false)
  }

  request (options) {
    const {key, exchange, message} = options
    const timeout = options.timeout
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
        const content = RabbitMQAdapter.getMessageContent(msg)
        return resolve({msg, content})
      })

      this.channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: RabbitMQAdapter.REPLY_QUEUE,
      })
    })
  }

  async respond (res, msg) {
    const {replyTo, correlationId} = msg.properties
    return this.channel.publish('', replyTo, Buffer.from(JSON.stringify(res)), {correlationId})
  }

  private async setupReplyQueue () {
    this.responseEmitter = new EventEmitter()
    this.responseEmitter.setMaxListeners(0)
    return this.channel.consume(RabbitMQAdapter.REPLY_QUEUE,
      (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg),
      {noAck: true})
  }

}
