const redis = {}
const {EventEmitter} = require('events')

class Publisher {
  constructor (adapter, topic) {
    this.adapter = adapter
    this.topic = topic
  }

  async publish (message) {
    return new Promise((resolve, reject) => {
      this.adapter.publisherClient.publish(this.topic, JSON.stringify(message),
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
    })
  }

  async close () {
    delete this.adapter.bus.publishersByTopics[this.topic]
    return Promise.resolve()
  }
}

class Subscriber extends EventEmitter {
  constructor (adapter, options) {
    super()
    this.adapter = adapter
    this.topic = options.topic
    this.messageHandler = this.createMessageHandler(options.onMessage,
      options.topic,
      options.onError)
    this.errorHandler = options.onError
  }

  // eslint-disable-next-line class-methods-use-this
  createMessageHandler (onMessage, subscriberTopic, onError) {
    return (topic, message) => {
      if (topic !== subscriberTopic) return

      process.nextTick(() => {
        let parsedMessage
        try {
          parsedMessage = JSON.parse(message)
        } catch (e) {
          if (onError) onError(e)
          return
        }
        onMessage(parsedMessage)
      })
    }
  }

  async listen () {
    this.adapter.subscriberClient.on('message', this.messageHandler)
    this.adapter.subscriberClient.on('error', this.errorHandler)
    return new Promise((resolve) => {
      this.adapter.subscriberClient.subscribe(this.topic, resolve)
    })
  }

  async close () {
    return new Promise((resolve, reject) => {
      this.adapter.subscriberClient.unsubscribe(this.topic,
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            this.adapter.subscriberClient.removeListener('error',
              this.messageHandler)
            this.adapter.subscriberClient.removeListener('message',
              this.errorHandler)
            delete this.adapter.bus.subscribersByTopics[this.topic]
            resolve(result)
          }
        })
    })
  }
}

class RedisAdapter {
  constructor (bus, redisOptions) {
    this.bus = bus
    this.redisOptions = redisOptions
    this.publisherClient = null
    this.subscriberClient = null
  }

  async init (client = 'publisherClient') {
    if (this[client]) {
      if (this[client] instanceof Promise) {
        return this[client]
      }
      return Promise.resolve(this)
    }

    this[client] = new Promise((resolve, reject) => {
      const redisClient = redis.createClient(this.redisOptions)
      if (client === 'subscriberClient') redisClient.setMaxListeners(0)

      redisClient.once('error', (err) => {
        this[client] = null
        reject(err)
      })

      redisClient.once('ready', () => {
        this[client] = redisClient
        resolve(this)
      })
    })

    return this[client]
  }

  async closeClient (client = 'publisherClient') {
    if (!this[client]) return Promise.resolve()

    if (this[client] instanceof Promise) return this[client]

    this[client] = new Promise((resolve, reject) => {
      this[client].quit((err, result) => {
        if (err) {
          reject(err)
        } else {
          this[client] = null
          resolve(result)
        }
      })
    })

    return this[client]
  }

  async close () {
    await this.closeClient('publisherClient')
    await this.closeClient('subscriberClient')
  }

  async publisher (options) {
    await this.init('publisherClient')
    return new Publisher(this, options.topic)
  }

  async subscriber (options) {
    await this.init('subscriberClient')
    return new Subscriber(this, options)
  }
}

module.exports = {RedisAdapter}
