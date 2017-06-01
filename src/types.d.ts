import {EventEmitter} from 'events'

export interface Adapter extends EventEmitter {
  connect (options): Promise<void>
  disconnect (): Promise<void>
  publish (key: string, ex: string, message: object): Promise<any>
  listen (key: string, handler: ListenHandler, noAck: boolean): Promise<any>
  ack (msg): void
  nack (msg): void
  request (options): Promise<any>
  respond (res, msg): Promise<boolean>
}

export interface SubscribeHandler {
  (msg: any, content: object): any
}

export interface ResponseHandler {
  (msg: any, content: object, respond: (response: object) => Promise<boolean>): any
}

interface ListenHandler {
  (msg: any, content: object, noAck: boolean): any
}
