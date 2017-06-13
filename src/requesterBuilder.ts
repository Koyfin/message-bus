import {BusWorker} from './types'
import {Events} from './events'

export default class RequesterBuilder {

  private static DEFAULT_TIMEOUT = 1000
  private worker: BusWorker
  private _key: string
  private _exchange: string
  private _timeout: number

  constructor (worker: BusWorker, key, ex = '') {
    this.worker = worker
    this._key = key
    this._exchange = ex
    this._timeout = RequesterBuilder.DEFAULT_TIMEOUT
  }

  exchange (): string
  exchange (exchange: string): this
  exchange (exchange?) {
    if (exchange === undefined) return this._exchange
    this._exchange = exchange
    return this
  }

  key (): string
  key (key: string): this
  key (key?) {
    if (key === undefined) return this._key
    this._key = key
    return this
  }

  timeout (): number
  timeout (timeout: number): this
  timeout (timeout?) {
    if (timeout === undefined) return this._timeout
    this._timeout = timeout
    return this
  }

  async request (message: object, route = Events.ROUTE_DEFAULT ) {
    const options = {
      key: this._key,
      exchange: this._exchange,
      timeout: this._timeout,
      route,
      message,
    }
    return this.worker.request(options)
  }

}
