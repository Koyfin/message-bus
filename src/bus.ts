export interface Adapter {
  connect (): Promise<any>
  disconnect (): Promise<any>
  publisher (options: any): Promise<any>
  subscriber (options: any): Promise<any>
}

class PublisherBuilder {

  private bus: Bus
  private topic: any

  constructor (bus, topic) {
    this.bus = bus
    this.topic = topic
  }

  async create () {
    const options = {
      topic: this.topic,
    }

    return this.bus.createPublisher(options)
  }

  async publish (message) {
    const publisher = await this.create()
    await publisher.publish(message)

    return publisher
  }
}

class SubscriberBuilder {

  private bus: Bus
  private topic: any
  private onMessageHandler: any
  private onErrorHandler: any

  constructor (bus, topic) {
    this.bus = bus
    this.topic = topic
    this.onMessageHandler = null
    //noinspection TsLint
    this.onErrorHandler = () => {}
  }

  onMessage (onMessageHandler) {
    this.onMessageHandler = onMessageHandler
    return this
  }

  onError (onErrorHandler) {
    this.onErrorHandler = onErrorHandler
    return this
  }

  async create () {
    if (!this.onMessageHandler) throw new Error('OnMessage handler required')
    const options = {
      topic: this.topic,
      onError: this.onErrorHandler,
      onMessage: this.onMessageHandler,
    }

    return this.bus.createSubscriber(options)
  }

  async listen () {
    const subscriber = await this.create()
    await subscriber.listen()

    return subscriber
  }
}

export class Bus {

  private adapter: Adapter
  private publishersByTopics: Object
  private subscribersByTopics: Object

  constructor (config, adapter: Adapter) {
    this.adapter = adapter

    this.publishersByTopics = {}
    this.subscribersByTopics = {}
  }

  connect () {
    return this.adapter.connect()
  }

  disconnect () {
    return this.adapter.disconnect()
  }

  publisher (topic) {
    if (this.getPublisher(topic)) {
      throw new Error(`Publisher with topic '${topic}' already exist`)
    }

    return new PublisherBuilder(this, topic)
  }

  subscriber (topic) {
    if (this.getSubscriber(topic)) {
      throw new Error(`Subscriber with topic '${topic}' already exist`)
    }

    return new SubscriberBuilder(this, topic)
  }

  getPublisher (topic) {
    return this.publishersByTopics[topic]
  }

  getSubscriber (topic) {
    return this.subscribersByTopics[topic]
  }

  async createPublisher (options) {
    if (this.getPublisher(options.topic)) {
      throw new Error(`Publisher with topic '${options.topic}' already exist`)
    }

    const publisher = await this.adapter.publisher(options)
    this.publishersByTopics[options.topic] = publisher

    return publisher
  }

  async createSubscriber (options) {
    if (this.getSubscriber(options.topic)) {
      throw new Error(`Subscriber with topic '${options.topic}' already exist`)
    }

    const subscriber = await this.adapter.subscriber(options)
    this.subscribersByTopics[options.topic] = subscriber

    return subscriber
  }

  async close () {
    await Promise.all(Object.keys(this.publishersByTopics)
      .map(topic => this.getPublisher(topic).close()))
    await Promise.all(Object.keys(this.subscribersByTopics)
      .map(topic => this.getSubscriber(topic).close()))
    return this.adapter.disconnect()
  }
}
