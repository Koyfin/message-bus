import {Bus} from './bus'
import {SubscribeHandler} from './types'
import {EventEmitter} from 'events'

export default class SubscriberBuilder {

  private bus: Bus
  private _key: string
  private _noAck: boolean
  private handler: (msg, content) => any
  private errorHandler: (error: Error) => any
  private eventEmitter: EventEmitter
  private subscriptionId: string

  constructor (bus, key) {
    this.bus = bus
    this._key = key
    this._noAck = false
    this.errorHandler = (error) => {
      console.log('default error')
      throw error
    }
    this.createEventEmitter()
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

  onMessage (handler: SubscribeHandler) {
    this.handler = handler
    return this
  }

  onError (handler) {
    this.errorHandler = handler
    return this
  }

  async subscribe () {
    if (!this.handler) {
      throw new Error('onMessage handler not set!')
    }
    this.subscriptionId = await this.bus.subscribe(this._key, this.eventEmitter, this._noAck)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.eventEmitter.removeAllListeners()
    return this.bus.unsubscribe(this.subscriptionId)
  }

  private createEventEmitter () {
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on('msg', ({msg, content}) => {
      this.handler(msg, content)
    })
    this.eventEmitter.on('error', (error) => {
      this.errorHandler(error)
    })
  }
}
