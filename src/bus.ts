import PublisherBuilder from './publisherBuilder'
import {Adapter} from './types'
import SubscriberBuilder from './subscriberBuilder'
import RequesterBuilder from './requesterBuilder'
import ResponderBuilder from './responderBuilder'
import {EventEmitter} from 'events'

export class Bus extends EventEmitter {

  private adapter: Adapter
  private options: object

  constructor (options, adapter: Adapter) {
    super()
    this.options = options
    this.adapter = adapter

    this.adapter.on('error', (error) => {
      this.emit('error', error)
    })
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

  requester (key, ex = '') {
    return new RequesterBuilder(this, key, ex)
  }

  responder (key) {
    return new ResponderBuilder(this, key)
  }

  publish (key, exchange, message) {
    return this.adapter.publish(key, exchange, message)
  }

  listen (key, handler) {
    return this.adapter.listen(key, handler)
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
