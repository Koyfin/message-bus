import {connect, Channel, Connection} from 'amqplib'

interface RabbitMQOptions {
  url: string
}

export class RabbitMQAdapter {

  private connection: Connection
  private channel: Channel
  private url: string
  private options: RabbitMQOptions

  constructor (options) {
    this.options = options
    this.url = options.url
  }

  async connect () {
    this.connection = await connect(this.url)
    this.channel = await this.connection.createChannel()
  }

  disconnect () {
    return this.connection.close()
  }
}
