import {Bus} from './bus'
import {EventEmitter} from 'events'

export default class SubscriberBuilder extends EventEmitter {

  private bus: Bus
  private _key: string
  private _noAck: boolean
  private subscriptionId: string

  constructor (bus, key) {

    super()

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

  async subscribe () {
    this.subscriptionId = await this.bus.subscribe(this._key, this, this._noAck)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.removeAllListeners()
    return this.bus.unsubscribe(this.subscriptionId)
  }

}
