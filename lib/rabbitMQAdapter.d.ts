/// <reference types="node" />
import { EventEmitter } from 'events';
import { Adapter } from './types';
import { Replies } from '@types/amqplib';
export declare class RabbitMQAdapter extends EventEmitter implements Adapter {
    private static REPLY_QUEUE;
    private connection;
    private channel;
    private options;
    private responseEmitter;
    constructor();
    private static getMessageContent(msg);
    connect(options: any): Promise<void>;
    disconnect(): Promise<void>;
    publish(key: any, exchange: any, message: any): Promise<boolean>;
    listen(queue: any, handler: any, noAck: any): Promise<Replies.Consume>;
    ack(msg: any): void;
    nack(msg: any): void;
    request(options: any): Promise<never>;
    respond(res: any, msg: any): Promise<boolean>;
    private setupReplyQueue();
}
