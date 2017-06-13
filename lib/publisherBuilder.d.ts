import { BusWorker } from './types';
export default class PublisherBuilder {
    private worker;
    private _key;
    private _exchange;
    constructor(worker: BusWorker, key: any, ex: any);
    exchange(): string;
    exchange(exchange: string): this;
    key(): string;
    key(key: string): this;
    publish(message: any): Promise<any>;
}
