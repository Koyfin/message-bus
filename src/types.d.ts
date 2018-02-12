import * as amqp from 'amqplib'

export interface BusWorker {
  connect (url: string, options: IBusWorkerOptions): Promise<void>
  disconnect (): Promise<void>
  configure (cb: (channel) => Promise<any>): Promise<any>
  channel (): amqp.Channel
  publish (key: string, ex: string, message: object): Promise<any>
  subscribe (key: string, eventEmitter: NodeJS.EventEmitter, noAck: boolean): Promise<any>
  unsubscribe (subscriptionId: string): Promise<void>
  ack (msg): void
  nack (msg, allUpTo, requeue): void
  request (options: RequestOptions): Promise<any>
  respond (res, msg): Promise<boolean>
}

interface RequestOptions {
  key: string,
  exchange: string,
  timeout: number,
  route: string,
  message: object,
}

type channelType = 'regular' | 'confirm'

interface IBusOptions {
  channelType?: channelType
}

interface IBusWorkerOptions {
  channelType?: channelType
}
