/// <reference types="node" />
import { EventEmitter } from 'events';
export default class SubscriberBuilder extends EventEmitter {
    private bus;
    private _key;
    private _noAck;
    private subscriptionId;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    noAck(): boolean;
    noAck(noAck: boolean): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
}
