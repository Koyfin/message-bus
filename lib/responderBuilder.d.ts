import { ResponseHandler } from './types';
export default class ResponderBuilder {
    private bus;
    private _key;
    private handler;
    private errorHandler;
    private eventEmitter;
    private subscriptionId;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    onRequest(handler: ResponseHandler): this;
    onError(handler: any): this;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    private createEventEmitter();
}
