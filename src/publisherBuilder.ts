import {Bus} from './bus'

export default class PublisherBuilder {

  private bus: Bus
  private _key: string
  private _exchange: string

  constructor (bus, key, ex = '') {
    this.bus = bus
    this._key = key
    this._exchange = ex
  }

  exchange (ex) {

    if (ex === undefined) return this._exchange

    this._exchange = ex
    return this

  }

  key (key) {
    if (key === undefined) return key

    this._key = key
    return this

  }

  async publish (message) {
    return this.bus.publish(this._key, this._exchange, message)
  }

}
