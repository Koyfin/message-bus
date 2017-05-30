import {Bus} from './bus'

export default class SubscriberBuilder {

  private bus: Bus
  private _key: string
  private handler: (msg, done, originalMsg) => void

  constructor (bus, key) {
    this.bus = bus
    this._key = key
  }

  key (key) {
    if (key === undefined) return this._key
    this._key = key
  }

  onMessage (handler: (msg, ack, originalMsg) => void) {
    this.handler = handler
    return this
  }

  listen () {
    return this.bus.listen(this._key, this.handler)
  }

}
