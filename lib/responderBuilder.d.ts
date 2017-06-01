import { ResponseHandler } from './types';
export default class ResponderBuilder {
    private bus;
    private _key;
    private handler;
    private errorHandler;
    constructor(bus: any, key: any);
    key(): string;
    key(key: string): this;
    onRequest(handler: ResponseHandler): this;
    onError(handler: any): this;
    listen(): Promise<any>;
    private handleRequest(msg, content);
    private respond(res, msg);
}
