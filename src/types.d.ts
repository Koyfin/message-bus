
export interface Adapter {
  connect (options): Promise<void>
  disconnect (): Promise<void>
  configure (cb: (channel) => Promise<any>): Promise<any>
  publish (key: string, ex: string, message: object): Promise<any>
  subscribe (key: string, eventEmitter: NodeJS.EventEmitter, noAck: boolean): Promise<any>
  unsubscribe (subscriptionId: string): Promise<void>
  ack (msg): void
  nack (msg): void
  request (options): Promise<any>
  respond (res, msg): Promise<boolean>
}

export interface ResponseHandler {
  (msg: any, content: object, respond: (response: object) => Promise<boolean>): any
}
