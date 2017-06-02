/// <reference types="node" />
import { Adapter } from './types';
export declare class RabbitMQAdapter implements Adapter {
    private static REPLY_QUEUE;
    private connection;
    private channel;
    private options;
    private responseEmitter;
    private static getMessageContent(msg);
    connect(options: any): Promise<void>;
    disconnect(): Promise<void>;
    publish(key: any, exchange: any, message: any): Promise<boolean>;
    subscribe(queue: any, eventEmitter: NodeJS.EventEmitter, noAck: any): Promise<string>;
    unsubscribe(consumerTag: string): Promise<void>;
    ack(msg: any): void;
    nack(msg: any): void;
    request(options: any): Promise<never>;
    respond(res: any, msg: any): Promise<boolean>;
    private setupReplyQueue();
}
