import {Bus} from './bus'

export default class RequesterBuilder {

  private bus: Bus
  private _key: string
  private _exchange: string
  private _timeout: number

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
    if (key === undefined) return this._key
    this._key = key
    return this
  }

  timeout (timeout) {
    if (timeout === undefined) return this._timeout
    this._timeout = timeout
    return this
  }

  async request (message) {
    const options = {
      key: this._key,
      exchange: this._exchange,
      message: message,
      timeout: this._timeout,
    }
    return this.bus.request(options)
  }

}
