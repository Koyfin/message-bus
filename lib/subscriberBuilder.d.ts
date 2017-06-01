import { SubscribeHandler } from './types';
export default class SubscriberBuilder {
    private bus;
    private _key;
    private _noAck;
    private handler;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    noAck(): boolean;
    noAck(noAck: boolean): this;
    onMessage(handler: SubscribeHandler): this;
    listen(): Promise<any>;
}
