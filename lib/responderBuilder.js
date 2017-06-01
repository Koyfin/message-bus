"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResponderBuilder {
    constructor(bus, key) {
        this.bus = bus;
        this._key = key;
    }
    key(key) {
        if (key === undefined)
            return this._key;
        this._key = key;
        return this;
    }
    onRequest(handler) {
        this.handler = handler;
        return this;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    listen() {
        return this.bus.listen(this._key, (msg, content) => this.handleRequest(msg, content), false);
    }
    handleRequest(msg, content) {
        this.handler(msg, content, (res) => this.respond(res, msg));
    }
    respond(res, msg) {
        return this.bus.respond(res, msg);
    }
}
exports.default = ResponderBuilder;
//# sourceMappingURL=responderBuilder.js.map