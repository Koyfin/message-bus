/// <reference types="node" />
import { EventEmitter } from 'events';
import { BusWorker } from './types';
export default class ResponderBuilder extends EventEmitter {
    private worker;
    private _key;
    private eventEmitter;
    private subscriptionId;
    constructor(worker: BusWorker, key: any);
    key(): string;
    key(key: string): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    private createEventEmitter();
}
