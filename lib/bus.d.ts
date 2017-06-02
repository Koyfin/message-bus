/// <reference types="node" />
import PublisherBuilder from './publisherBuilder';
import { Adapter } from './types';
import SubscriberBuilder from './subscriberBuilder';
import RequesterBuilder from './requesterBuilder';
import ResponderBuilder from './responderBuilder';
import { EventEmitter } from 'events';
export declare class Bus extends EventEmitter {
    private adapter;
    private options;
    constructor(options: {
        url: string;
        adapter: Adapter;
    });
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publisher(key?: string, ex?: string): PublisherBuilder;
    subscriber(key: any): SubscriberBuilder;
    unsubscribe(subscriptionId: string): Promise<void>;
    requester(key: any, ex?: string): RequesterBuilder;
    responder(key: any): ResponderBuilder;
    publish(key: any, exchange: any, message: any): Promise<any>;
    subscribe(key: any, eventEmitter: any, noAck: any): Promise<any>;
    request(options: any): Promise<any>;
    respond(res: any, msg: any): Promise<boolean>;
    ack(msg: any): void;
    nack(msg: any): void;
}
