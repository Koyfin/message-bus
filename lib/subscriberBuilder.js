"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubscriberBuilder {
    constructor(bus, key) {
        this.bus = bus;
        this._key = key;
        this._noAck = false;
    }
    key(key) {
        if (key === undefined)
            return this._key;
        this._key = key;
        return this;
    }
    noAck(noAck) {
        if (noAck === undefined)
            return this._noAck;
        this._noAck = noAck;
        return this;
    }
    onMessage(handler) {
        this.handler = handler;
        return this;
    }
    listen() {
        return this.bus.listen(this._key, this.handler, this._noAck);
    }
}
exports.default = SubscriberBuilder;
//# sourceMappingURL=subscriberBuilder.js.map