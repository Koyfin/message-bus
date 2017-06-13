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
class RequesterBuilder {
    constructor(worker, key, ex = '') {
        this.worker = worker;
        this._key = key;
        this._exchange = ex;
        this._timeout = RequesterBuilder.DEFAULT_TIMEOUT;
    }
    exchange(exchange) {
        if (exchange === undefined)
            return this._exchange;
        this._exchange = exchange;
        return this;
    }
    key(key) {
        if (key === undefined)
            return this._key;
        this._key = key;
        return this;
    }
    timeout(timeout) {
        if (timeout === undefined)
            return this._timeout;
        this._timeout = timeout;
        return this;
    }
    request(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                key: this._key,
                exchange: this._exchange,
                message: message,
                timeout: this._timeout,
            };
            return this.worker.request(options);
        });
    }
}
RequesterBuilder.DEFAULT_TIMEOUT = 1000;
exports.default = RequesterBuilder;
//# sourceMappingURL=requesterBuilder.js.map