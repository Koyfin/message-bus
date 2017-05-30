import PublisherBuilder from './publisherBuilder'
import {Adapter} from './types'
import SubscriberBuilder from './subscriberBuilder'

export class Bus {

  private adapter: Adapter
  private options: object

  constructor (options, adapter: Adapter) {
    this.options = options
    this.adapter = adapter
  }

  connect () {
    return this.adapter.connect(this.options)
  }

  disconnect () {
    return this.adapter.disconnect()
  }

  publisher (key, ex = '') {
    return new PublisherBuilder(this, key, ex)
  }

  subscriber (key) {
    return new SubscriberBuilder(this, key)
  }

  publish (key, exchange, message) {
    return this.adapter.publish(key, exchange, message)
  }

  consume (key, handler) {
    return this.adapter.consume(key, handler)
  }
}
