import {Bus} from './bus'
import {EventEmitter} from 'events'
import {Events} from './events'

export default class ResponderBuilder extends EventEmitter {

  private bus: Bus
  private _key: string
  private eventEmitter: EventEmitter
  private subscriptionId: string

  constructor (bus, key) {
    super()
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

  async subscribe () {
    this.subscriptionId = await this.bus.subscribe(this._key, this.eventEmitter, true)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.eventEmitter.removeAllListeners()
    return this.bus.unsubscribe(this.subscriptionId)
  }

  private createEventEmitter () {
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on(Events.MESSAGE, (message, content) => {
      this.emit(Events.REQUEST, message, content, (res) => this.bus.respond(res, message))
    })
    this.eventEmitter.on(Events.ERROR, (error) => this.emit(Events.ERROR, error))
  }

}
