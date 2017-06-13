import * as amqp from 'amqplib'

export interface BusWorker {
  connect (options): Promise<void>
  disconnect (): Promise<void>
  configure (cb: (channel) => Promise<any>): Promise<any>
  channel (): amqp.Channel
  publish (key: string, ex: string, message: object): Promise<any>
  subscribe (key: string, eventEmitter: NodeJS.EventEmitter, noAck: boolean): Promise<any>
  unsubscribe (subscriptionId: string): Promise<void>
  ack (msg): void
  nack (msg): void
  request (options): Promise<any>
  respond (res, msg): Promise<boolean>
}
