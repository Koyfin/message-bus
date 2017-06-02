import { SubscribeHandler } from './types';
export default class SubscriberBuilder {
    private bus;
    private _key;
    private _noAck;
    private handler;
    private errorHandler;
    private eventEmitter;
    private subscriptionId;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    noAck(): boolean;
    noAck(noAck: boolean): this;
    onMessage(handler: SubscribeHandler): this;
    onError(handler: any): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    private createEventEmitter();
}
