import { BusWorker } from './types';
export default class RequesterBuilder {
    private static DEFAULT_TIMEOUT;
    private worker;
    private _key;
    private _exchange;
    private _timeout;
    constructor(worker: BusWorker, key: any, ex?: string);
    exchange(): string;
    exchange(exchange: string): this;
    key(): string;
    key(key: string): this;
    timeout(): number;
    timeout(timeout: number): this;
    request(message: object, route?: string): Promise<any>;
}
