import PublisherBuilder from './publisherBuilder';
import SubscriberBuilder from './subscriberBuilder';
import RequesterBuilder from './requesterBuilder';
import ResponderBuilder from './responderBuilder';
export declare class Bus {
    private worker;
    private options;
    private constructor(options);
    static connect(url: string): Promise<Bus>;
    disconnect(): Promise<void>;
    configure(cb: (channel) => Promise<any>): Promise<any>;
    publisher(key?: string, ex?: string): PublisherBuilder;
    subscriber(key: any): SubscriberBuilder;
    requester(key: any, ex?: string): RequesterBuilder;
    responder(key: any): ResponderBuilder;
    ack(msg: any): void;
    nack(msg: any): void;
}
