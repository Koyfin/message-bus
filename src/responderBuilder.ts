import {EventEmitter} from 'events'
import {Events} from './events'
import {BusWorker} from './types'

export default class ResponderBuilder extends EventEmitter {

  private worker: BusWorker
  private _key: string
  private eventEmitter: EventEmitter
  private subscriptionId: string

  constructor (worker: BusWorker, key) {
    super()
    this.worker = worker
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
    this.subscriptionId = await this.worker.subscribe(this._key, this.eventEmitter, true)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.eventEmitter.removeAllListeners()
    return this.worker.unsubscribe(this.subscriptionId)
  }

  // promise rejection support
  // TODO: refactor responder to something like koa. Current solution is very kostyl-like
  on (event: string | symbol, listener: Function) {

    if (event === 'error') return super.on(event, listener)

    super.on(event, async (...args) => {
      // trying to support bus responses here
      const hasMessage = args[0] && args[0].content
      const message = hasMessage ? args[0] : undefined
      const respond = hasMessage ? (res) => this.worker.respond(res, message) : undefined

      try {
        await listener(...args)
      } catch (error) {
        this.emit('error', error, message, respond)
      }
    })
    return this
  }

  private createEventEmitter () {
    this.eventEmitter = new EventEmitter()
    this.eventEmitter.on(Events.MESSAGE, (message, content) => {
      let route = message.properties.type || Events.ROUTE_DEFAULT
      if (!this.listenerCount(route)) {
        route = Events.ROUTE_NOT_FOUND
      }
      this.emit(route, message, content, (res) => this.worker.respond(res, message))
    })
    this.eventEmitter.on(Events.ERROR, (error, message) => {
      this.emit(Events.ERROR, error, message, (res) => this.worker.respond(res, message))
    })
  }

}
