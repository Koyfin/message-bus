import PublisherBuilder from './publisherBuilder'
import {RabbitMQWorker} from './rabbitMQWorker'
import SubscriberBuilder from './subscriberBuilder'
import RequesterBuilder from './requesterBuilder'
import ResponderBuilder from './responderBuilder'
import {BusWorker} from './types'
import {Channel} from '@types/amqplib'

export class Bus {

  private worker: BusWorker
  private options: object

  private constructor (options: { worker: BusWorker }) {
    this.options = options
    this.worker = options.worker
  }

  static async connect (url: string) {
    const bus = new Bus({worker: new RabbitMQWorker()})
    await bus.worker.connect(url)
    return bus
  }

  disconnect () {
    return this.worker.disconnect()
  }

  configure (cb: (channel) => Promise<any>) {
    return this.worker.configure(cb)
  }

  channel () {
    return this.worker.channel()
  }

  publisher (key = '', ex = '') {
    return new PublisherBuilder(this.worker, key, ex)
  }

  subscriber (key) {
    return new SubscriberBuilder(this.worker, key)
  }

  requester (key, ex = '') {
    return new RequesterBuilder(this.worker, key, ex)
  }

  responder (key) {
    return new ResponderBuilder(this.worker, key)
  }

  ack (msg) {
    return this.worker.ack(msg)
  }

  nack (msg, allUpTo = false, requeue = true) {
    return this.worker.nack(msg, allUpTo, requeue)
  }
}
