import {Bus} from './bus'

export default class ResponderBuilder {

  private bus: Bus
  private _key: string
  private handler: (msg, content, respond) => any
  private errorHandler: (error) => any

  constructor (bus, key) {
    this.bus = bus
    this._key = key
  }

  key (): string
  key (key: string): this
  key (key?) {
    if (key === undefined) return this._key
    this._key = key
    return this
  }

  onRequest (handler) {
    this.handler = handler
    return this
  }

  onError (handler) {
    this.errorHandler = handler
    return this
  }

  listen () {
    return this.bus.listen(this._key, (msg, content) => this.handleRequest(msg, content), false)
  }

  private handleRequest (msg, content) {
    this.handler(msg, content, (res) => {
      return this.respond(res, msg)
    })
  }

  private respond (res, msg) {
    return this.bus.respond(res, msg)
  }

}
