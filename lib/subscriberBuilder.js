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
class SubscriberBuilder extends events_1.EventEmitter {
    constructor(worker, key) {
        super();
        this.worker = worker;
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
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptionId = yield this.worker.subscribe(this._key, this, this._noAck);
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.subscriptionId)
                return;
            this.removeAllListeners();
            return this.worker.unsubscribe(this.subscriptionId);
        });
    }
}
exports.default = SubscriberBuilder;
//# sourceMappingURL=subscriberBuilder.js.map