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
const events_2 = require("./events");
class RabbitMQWorker {
    static getMessageContent(msg) {
        return JSON.parse(msg.content.toString());
    }
    connect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.url = url;
            //noinspection TsLint
            this.connection = yield amqplib.connect(this.url);
            this._channel = yield this.connection.createChannel();
            yield this.setupReplyQueue();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.close();
        });
    }
    configure(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            yield cb(this._channel);
        });
    }
    channel() {
        return this._channel;
    }
    publish(key, exchange, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!key && !exchange) {
                throw new Error(`please specify key or exchange. key="${key}" exchange="${exchange}"`);
            }
            const content = Buffer.from(JSON.stringify(message));
            return this._channel.publish(exchange, key, content);
        });
    }
    subscribe(queue, eventEmitter, noAck) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = { noAck };
            const { consumerTag } = yield this._channel.consume(queue, (message) => {
                try {
                    const content = RabbitMQWorker.getMessageContent(message);
                    eventEmitter.emit(events_2.Events.MESSAGE, message, content);
                }
                catch (error) {
                    if (!noAck) {
                        this.nack(message);
                    }
                    eventEmitter.emit(events_2.Events.ERROR, error, message);
                }
            }, options);
            return consumerTag;
        });
    }
    unsubscribe(consumerTag) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._channel.cancel(consumerTag);
        });
    }
    ack(msg) {
        return this._channel.ack(msg);
    }
    nack(msg) {
        return this._channel.nack(msg, false, false);
    }
    request(options) {
        const { key, exchange, timeout, route, message } = options;
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
                const content = RabbitMQWorker.getMessageContent(msg);
                return resolve({ msg, content });
            });
            this._channel.publish(exchange, key, Buffer.from(JSON.stringify(message)), {
                correlationId,
                replyTo: RabbitMQWorker.REPLY_QUEUE,
                type: route,
            });
        });
    }
    respond(res, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { replyTo, correlationId } = msg.properties;
            return this._channel.publish('', replyTo, Buffer.from(JSON.stringify(res)), { correlationId });
        });
    }
    setupReplyQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            this.responseEmitter = new events_1.EventEmitter();
            this.responseEmitter.setMaxListeners(0);
            return this._channel.consume(RabbitMQWorker.REPLY_QUEUE, (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg), { noAck: true });
        });
    }
}
RabbitMQWorker.REPLY_QUEUE = 'amq.rabbitmq.reply-to';
exports.RabbitMQWorker = RabbitMQWorker;
//# sourceMappingURL=rabbitMQWorker.js.map