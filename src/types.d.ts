import * as amqp from 'amqplib'
import { Options, Message } from 'amqplib/properties';

export interface BusWorker {
  connect (url: string, options: IBusWorkerOptions): Promise<void>
  disconnect (): Promise<void>
  configure (cb: (channel) => Promise<any>): Promise<any>
  channel (): amqp.Channel
  publish (key: string, ex: string, message: object, options?: Options.Publish, toJson?: boolean): Promise<any>
  subscribe (key: string, eventEmitter: NodeJS.EventEmitter, noAck: boolean, json?: boolean): Promise<any>
  unsubscribe (subscriptionId: string): Promise<void>
  ack (msg): void
  nack (msg, allUpTo, requeue): void
  request (options: RequestOptions): Promise<any>
  respond (res: any, msg: Message, json: boolean, options: Options.Publish): Promise<boolean>
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
  channelType?: channelType,
  socketOptions?: any
}

interface IBusWorkerOptions {
  channelType?: channelType,
  socketOptions?: any
}
