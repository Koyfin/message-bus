export default class RequesterBuilder {
    private static DEFAULT_TIMEOUT;
    private bus;
    private _key;
    private _exchange;
    private _timeout;
    constructor(bus: any, key: any, ex?: string);
    exchange(): string;
    exchange(exchange: string): this;
    key(): string;
    key(key: string): this;
    timeout(): number;
    timeout(timeout: number): this;
    request(message: any): Promise<any>;
}
