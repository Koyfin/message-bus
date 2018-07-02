import { BusWorker } from './types'
import { Options } from 'amqplib/properties'

export default class PublisherBuilder {

  private worker: BusWorker
  private _key: string
  private _exchange: string
  private _json: boolean = true

  constructor (worker: BusWorker, key, ex) {
    this.worker = worker
    this._key = key
    this._exchange = ex
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
    if (key === undefined) return key

    this._key = key
    return this

  }

  json (json: boolean) {
    this._json = json
    return this
  }

  publish (message, options?: Options.Publish) {
    return this.worker.publish(this._key, this._exchange, message, options, this._json)
  }

}
