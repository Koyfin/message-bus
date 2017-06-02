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
const events_1 = require("events");
class SubscriberBuilder {
    constructor(bus, key) {
        this.bus = bus;
        this._key = key;
        this._noAck = false;
        this.errorHandler = (error) => {
            console.log('default error');
            throw error;
        };
        this.createEventEmitter();
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
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.handler) {
                throw new Error('onMessage handler not set!');
            }
            this.subscriptionId = yield this.bus.subscribe(this._key, this.eventEmitter, this._noAck);
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.subscriptionId)
                return;
            this.eventEmitter.removeAllListeners();
            return this.bus.unsubscribe(this.subscriptionId);
        });
    }
    createEventEmitter() {
        this.eventEmitter = new events_1.EventEmitter();
        this.eventEmitter.on('msg', ({ msg, content }) => {
            this.handler(msg, content);
        });
        this.eventEmitter.on('error', (error) => {
            this.errorHandler(error);
        });
    }
}
exports.default = SubscriberBuilder;
//# sourceMappingURL=subscriberBuilder.js.map