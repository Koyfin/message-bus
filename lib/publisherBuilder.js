"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PublisherBuilder {
    constructor(bus, key, ex) {
        this.bus = bus;
        this._key = key;
        this._exchange = ex;
    }
    exchange(exchange) {
        if (exchange === undefined)
            return this._exchange;
        this._exchange = exchange;
        return this;
    }
    key(key) {
        if (key === undefined)
            return key;
        this._key = key;
        return this;
    }
    publish(message) {
        return this.bus.publish(this._key, this._exchange, message);
    }
}
exports.default = PublisherBuilder;
//# sourceMappingURL=publisherBuilder.js.map