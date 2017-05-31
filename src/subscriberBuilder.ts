import {Bus} from './bus'

export default class SubscriberBuilder {

  private bus: Bus
  private _key: string
  private _noAck: boolean
  private handler: (msg, done, originalMsg) => void

  constructor (bus, key) {
    this.bus = bus
    this._key = key
    this._noAck = false
  }

  key (): string
  key (key: string): this
  key (key?) {
    if (key === undefined) return this._key
    this._key = key
    return this
  }

  noAck (): boolean
  noAck (noAck: boolean): this
  noAck (noAck?) {
    if (noAck === undefined) return this._noAck
    this._noAck = noAck
    return this
  }

  onMessage (handler) {
    this.handler = handler
    return this
  }

  listen () {
    return this.bus.listen(this._key, this.handler, this._noAck)
  }
}
