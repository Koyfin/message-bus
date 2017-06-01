export default class PublisherBuilder {
    private bus;
    private _key;
    private _exchange;
    constructor(bus: any, key: any, ex: any);
    exchange(): string;
    exchange(exchange: string): this;
    key(): string;
    key(key: string): this;
    publish(message: any): Promise<any>;
}
