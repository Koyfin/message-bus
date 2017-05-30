import {Bus} from './bus'

export default class SubscriberBuilder {

  private bus: Bus
  private key: string
  // private onMessageHandler: any
  // private onErrorHandler: any

  constructor (bus, key) {
    this.bus = bus
    this.key = key
    // this.onMessageHandler = null
    // this.onErrorHandler = () => {}
  }

  consume (key, handler) {
    return this.bus.consume(key, handler)
  }
}
