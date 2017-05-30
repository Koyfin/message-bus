import * as amqplib from 'amqplib'
import {Adapter} from '../types'

interface RabbitMQOptions {
  url: string
}

export class RabbitMQAdapter implements Adapter {

  private connection: amqplib.Connection
  private channel: amqplib.Channel
  private options: RabbitMQOptions

  async connect (options) {
    this.options = options
    this.connection = await amqplib.connect(this.options.url)
    this.channel = await this.connection.createChannel()
  }

  async disconnect () {
    await this.connection.close()
  }

  async publish (key, exchange, message) {
    const content = Buffer.from(JSON.stringify(message))
    console.log(key, exchange, message)
    return this.channel.publish(exchange, key, content)
  }

  consume (queue, handler) {
    return this.channel.consume(queue, handler)
  }

}
