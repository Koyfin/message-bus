import {Bus} from './bus'
import {ResponseHandler} from './types'
import {EventEmitter} from 'events'

export default class ResponderBuilder {

  private bus: Bus
  private _key: string
  private handler: (msg, content, respond) => any
  private errorHandler: (error: Error) => any
  private eventEmitter: EventEmitter
  private subscriptionId: string

  constructor (bus, key) {
    this.bus = bus
    this._key = key
    this.createEventEmitter()
  }

  key (): string
  key (key: string): this
  key (key?) {
    if (key === undefined) return this._key
    this._key = key
    return this
  }

  onRequest (handler: ResponseHandler) {
    this.handler = handler
    return this
  }

  onError (handler) {
    this.errorHandler = handler
    return this
  }

  async subscribe () {
    if (!this.handler) {
      throw new Error('onRequest handler not set!')
    }
    this.subscriptionId = await this.bus.subscribe(this._key, this.eventEmitter, false)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.eventEmitter.removeAllListeners()
    return this.bus.unsubscribe(this.subscriptionId)
  }

  private createEventEmitter () {
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on('msg', ({msg, content}) => {
      this.handler(msg, content, (res) => this.bus.respond(res, msg))
    })
    this.eventEmitter.on('error', (error) => this.errorHandler(error))
  }

}
