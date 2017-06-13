/// <reference types="node" />
import * as amqplib from 'amqplib';
import { BusWorker } from './types';
export declare class RabbitMQWorker implements BusWorker {
    private static REPLY_QUEUE;
    private connection;
    private _channel;
    private url;
    private responseEmitter;
    private static getMessageContent(msg);
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    configure(cb: (channel: amqplib.Channel) => Promise<any>): Promise<void>;
    channel(): amqplib.Channel;
    publish(key: any, exchange: any, message: any): Promise<boolean>;
    subscribe(queue: any, eventEmitter: NodeJS.EventEmitter, noAck: any): Promise<string>;
    unsubscribe(consumerTag: string): Promise<void>;
    ack(msg: any): void;
    nack(msg: any): void;
    request(options: any): Promise<never>;
    respond(res: any, msg: any): Promise<boolean>;
    private setupReplyQueue();
}
