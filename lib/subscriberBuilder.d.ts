/// <reference types="node" />
import { EventEmitter } from 'events';
import { BusWorker } from './types';
export default class SubscriberBuilder extends EventEmitter {
    private worker;
    private _key;
    private _noAck;
    private subscriptionId;
    constructor(worker: BusWorker, key: any);
    key(): string;
    key(key: string): this;
    noAck(): boolean;
    noAck(noAck: boolean): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
}
