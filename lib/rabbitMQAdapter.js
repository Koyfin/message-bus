"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid");
const amqplib = require("amqplib");
const events_1 = require("events");
class RabbitMQAdapter extends events_1.EventEmitter {
    constructor() {
        super();
    }
    static getMessageContent(msg) {
        return JSON.parse(msg.content.toString());
    }
    connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.options = options;
            this.connection = yield amqplib.connect(this.options.url);
            this.channel = yield this.connection.createChannel();
            yield this.setupReplyQueue();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.close();
        });
    }
    publish(key, exchange, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key && !exchange) {
                throw new Error(`please specify key or exchange. key="${key}" exchange="${exchange}"`);
            }
            const content = Buffer.from(JSON.stringify(message));
            return this.channel.publish(exchange, key, content);
        });
    }
    listen(queue, handler, noAck) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = { noAck };
            return this.channel.consume(queue, (msg) => {
                try {
                    const content = RabbitMQAdapter.getMessageContent(msg);
                    handler(msg, content);
                }
                catch (error) {
                    this.nack(msg);
                    this.emit('error', error);
                }
            }, options);
        });
    }
    ack(msg) {
        return this.channel.ack(msg);
    }
    nack(msg) {
        return this.channel.nack(msg, false, false);
    }
    request(options) {
        const { key, exchange, message } = options;
        const timeout = options.timeout;
        if (!key && !exchange) {
            return Promise.reject(`please specify key or exchange. key="${key}" exchange="${exchange}"`);
        }
        return new Promise((resolve, reject) => {
            const correlationId = uuid.v4();
            const timeoutId = setTimeout(() => {
                this.responseEmitter.removeAllListeners(correlationId);
                reject(new Error('todo: timeout'));
            }, timeout);
            this.responseEmitter.once(correlationId, (msg) => {
                clearTimeout(timeoutId);
                const content = RabbitMQAdapter.getMessageContent(msg);
                return resolve({ msg, content });
            });
            this.channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: RabbitMQAdapter.REPLY_QUEUE,
            });
        });
    }
    respond(res, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { replyTo, correlationId } = msg.properties;
            return this.channel.publish('', replyTo, Buffer.from(JSON.stringify(res)), { correlationId });
        });
    }
    setupReplyQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.responseEmitter = new events_1.EventEmitter();
            this.responseEmitter.setMaxListeners(0);
            return this.channel.consume(RabbitMQAdapter.REPLY_QUEUE, (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg), { noAck: true });
        });
    }
}
RabbitMQAdapter.REPLY_QUEUE = 'amq.rabbitmq.reply-to';
exports.RabbitMQAdapter = RabbitMQAdapter;
//# sourceMappingURL=rabbitMQAdapter.js.map