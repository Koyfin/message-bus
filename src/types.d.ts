import {EventEmitter} from 'events'

export interface Adapter extends EventEmitter {
  connect (options): Promise<void>
  disconnect (): Promise<void>
  publish (key: string, ex: string, message: object): Promise<any>
  listen (key: string, handler: any): Promise<any>
  ack (msg): void
  nack (msg): void
  request (options): Promise<any>
  respond (res, msg): Promise<boolean>
}
