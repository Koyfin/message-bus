import * as uuid from 'uuid'
import * as amqplib from 'amqplib'
import {EventEmitter} from 'events'
import {Adapter} from './types'

interface RabbitMQOptions {
  url: string
}

export class RabbitMQAdapter extends EventEmitter implements Adapter {

  private static REPLY_QUEUE = 'amq.rabbitmq.reply-to'
  private static RESPONSE_TIMEOUT = 1000

  private connection: amqplib.Connection
  private channel: amqplib.Channel
  private options: RabbitMQOptions
  private responseEmitter: EventEmitter

  constructor () {
    super()
  }

  private static getMessageContent (msg) {
    return JSON.parse(msg.content.toString())
  }

  async connect (options) {
    this.options = options
    this.connection = await amqplib.connect(this.options.url)
    this.channel = await this.connection.createChannel()
    await this.setupReplyQueue()
  }

  async disconnect () {
    await this.connection.close()
  }

  setupReplyQueue () {
    this.responseEmitter = new EventEmitter()
    this.responseEmitter.setMaxListeners(0)
    return this.channel.consume(RabbitMQAdapter.REPLY_QUEUE,
      (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg.content),
      {noAck: true})
  }

  async publish (key, exchange, message) {
    const content = Buffer.from(JSON.stringify(message))
    console.log(key, exchange, message)
    return this.channel.publish(exchange, key, content)
  }

  async listen (queue, handler) {
    return this.channel.consume(queue, (msg) => {
      try {
        const content = RabbitMQAdapter.getMessageContent(msg)
        handler(msg, content, (msg) => this.ack(msg))
      } catch (error) {
        this.nack(msg)
        this.emit('error', error)
      }
    })
  }

  ack (msg) {
    return this.channel.ack(msg)
  }

  nack (msg) {
    return this.channel.nack(msg, false, false)
  }

  request (options) {
    const {key, exchange, message} = options
    const timeout = options.timeout || RabbitMQAdapter.RESPONSE_TIMEOUT
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

      this.channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), {correlationId, replyTo: RabbitMQAdapter.REPLY_QUEUE})
    })
  }

  async respond (res, msg) {
    const {replyTo, correlationId} = msg.properties
    return this.channel.publish('', replyTo, Buffer.from(JSON.stringify(res)), {correlationId})
  }
}
