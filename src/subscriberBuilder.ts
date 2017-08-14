import { EventEmitter } from 'events'
import { BusWorker } from './types'

export default class SubscriberBuilder extends EventEmitter {

  private worker: BusWorker
  private _key: string
  private _noAck: boolean
  private subscriptionId: string

  constructor (worker: BusWorker, key) {

    super()

    this.worker = worker
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

  async subscribe () {
    this.subscriptionId = await this.worker.subscribe(this._key, this, this._noAck)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.removeAllListeners()
    return this.worker.unsubscribe(this.subscriptionId)
  }

}
