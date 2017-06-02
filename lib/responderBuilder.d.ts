/// <reference types="node" />
import { EventEmitter } from 'events';
export default class ResponderBuilder extends EventEmitter {
    private bus;
    private _key;
    private handler;
    private errorHandler;
    private eventEmitter;
    private subscriptionId;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    private createEventEmitter();
}
