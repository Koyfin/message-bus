import {Bus} from './bus'

export default class ResponderBuilder {

  private bus: Bus
  private _key: string
  private handler: (msg, respond) => any
  private errorHandler: (error) => any

  constructor (bus, key) {
    this.bus = bus
    this._key = key
  }

  key (key) {
    if (key === undefined) return this._key
    this._key = key
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
    return this.bus.listen(this._key, (msg, content) => this.handleRequest(msg, content))
  }

  handleRequest (msg, content) {
    this.handler(content, (res) => {
      this.respond(res, msg)
    })
  }

  respond (res, msg) {
    return this.bus.respond(res, msg)
  }

}
