import PublisherBuilder from './publisherBuilder'
import {Adapter} from './types'
import SubscriberBuilder from './subscriberBuilder'
import RequesterBuilder from './requesterBuilder'
import ResponderBuilder from './responderBuilder'

export class Bus {

  private adapter: Adapter
  private options: object

  constructor (options: { url: string, adapter: Adapter }) {
    this.options = options
    this.adapter = options.adapter
  }

  connect () {
    return this.adapter.connect(this.options)
  }

  disconnect () {
    return this.adapter.disconnect()
  }

  configure (cb: (channel) => Promise<any>) {
    return this.adapter.configure(cb)
  }

  publisher (key = '', ex = '') {
    return new PublisherBuilder(this, key, ex)
  }

  subscriber (key) {
    return new SubscriberBuilder(this, key)
  }

  unsubscribe (subscriptionId: string) {
    return this.adapter.unsubscribe(subscriptionId)
  }

  requester (key, ex = '') {
    return new RequesterBuilder(this, key, ex)
  }

  responder (key) {
    return new ResponderBuilder(this, key)
  }

  publish (key, exchange, message) {
    return this.adapter.publish(key, exchange, message)
  }

  subscribe (key, eventEmitter: NodeJS.EventEmitter, noAck) {
    return this.adapter.subscribe(key, eventEmitter, noAck)
  }

  request (options) {
    return this.adapter.request(options)
  }

  respond (res, msg) {
    return this.adapter.respond(res, msg)
  }

  ack (msg) {
    return this.adapter.ack(msg)
  }

  nack (msg) {
    return this.adapter.nack(msg)
  }
}
