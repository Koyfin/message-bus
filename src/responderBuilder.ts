import { EventEmitter } from 'events'
import { Events } from './events'
import { BusWorker } from './types'
import { Message, Options } from 'amqplib/properties'

export interface RespondFunction {
  (response: any, options?: Options.Publish): void
}

export default class ResponderBuilder extends EventEmitter {
  private worker: BusWorker
  private _key: string
  private eventEmitter: EventEmitter
  private subscriptionId: string
  private _json: boolean = true

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

  json (json: boolean) {
    this._json = json
    return this
  }

  async subscribe () {
    this.subscriptionId = await this.worker.subscribe(this._key, this.eventEmitter, true, this._json)
  }

  async unsubscribe () {
    if (!this.subscriptionId) return
    this.eventEmitter.removeAllListeners()
    return this.worker.unsubscribe(this.subscriptionId)
  }

  // promise rejection support
  // TODO: refactor responder to something like koa. Current solution is very kostyl-like
  on (event: string | symbol, listener: (msg: Message, content: any, respond: RespondFunction) => void) {
    if (event === 'error') return super.on(event, listener)

    super.on(event, async (message: Message, content: any) => {
      const respond: RespondFunction = (message && message.content) ? (res: any, options?: Options.Publish) => this.worker.respond(res, message, this._json, options) : noop
      try {
        await listener(message, content, respond)
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
      this.emit(route, message, content, (res, options?: Options.Publish) => this.worker.respond(res, message, this._json, options))
    })
    this.eventEmitter.on(Events.ERROR, (error, message) => {
      this.emit(Events.ERROR, error, message, (res, options?: Options.Publish) => this.worker.respond(res, message, this._json, options))
    })
  }
}

// tslint:disable-next-line
function noop () {}
