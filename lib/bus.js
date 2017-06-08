"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const publisherBuilder_1 = require("./publisherBuilder");
const subscriberBuilder_1 = require("./subscriberBuilder");
const requesterBuilder_1 = require("./requesterBuilder");
const responderBuilder_1 = require("./responderBuilder");
class Bus {
    constructor(options) {
        this.options = options;
        this.adapter = options.adapter;
    }
    connect() {
        return this.adapter.connect(this.options);
    }
    disconnect() {
        return this.adapter.disconnect();
    }
    configure(cb) {
        return this.adapter.configure(cb);
    }
    publisher(key = '', ex = '') {
        return new publisherBuilder_1.default(this, key, ex);
    }
    subscriber(key) {
        return new subscriberBuilder_1.default(this, key);
    }
    unsubscribe(subscriptionId) {
        return this.adapter.unsubscribe(subscriptionId);
    }
    requester(key, ex = '') {
        return new requesterBuilder_1.default(this, key, ex);
    }
    responder(key) {
        return new responderBuilder_1.default(this, key);
    }
    publish(key, exchange, message) {
        return this.adapter.publish(key, exchange, message);
    }
    subscribe(key, eventEmitter, noAck) {
        return this.adapter.subscribe(key, eventEmitter, noAck);
    }
    request(options) {
        return this.adapter.request(options);
    }
    respond(res, msg) {
        return this.adapter.respond(res, msg);
    }
    ack(msg) {
        return this.adapter.ack(msg);
    }
    nack(msg) {
        return this.adapter.nack(msg);
    }
}
exports.Bus = Bus;
//# sourceMappingURL=bus.js.map