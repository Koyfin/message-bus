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
const publisherBuilder_1 = require("./publisherBuilder");
const rabbitMQWorker_1 = require("./rabbitMQWorker");
const subscriberBuilder_1 = require("./subscriberBuilder");
const requesterBuilder_1 = require("./requesterBuilder");
const responderBuilder_1 = require("./responderBuilder");
class Bus {
    constructor(options) {
        this.options = options;
        this.worker = options.worker;
    }
    static connect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const bus = new Bus({ worker: new rabbitMQWorker_1.RabbitMQWorker() });
            yield bus.worker.connect(url);
            return bus;
        });
    }
    disconnect() {
        return this.worker.disconnect();
    }
    configure(cb) {
        return this.worker.configure(cb);
    }
    publisher(key = '', ex = '') {
        return new publisherBuilder_1.default(this.worker, key, ex);
    }
    subscriber(key) {
        return new subscriberBuilder_1.default(this.worker, key);
    }
    requester(key, ex = '') {
        return new requesterBuilder_1.default(this.worker, key, ex);
    }
    responder(key) {
        return new responderBuilder_1.default(this.worker, key);
    }
    ack(msg) {
        return this.worker.ack(msg);
    }
    nack(msg) {
        return this.worker.nack(msg);
    }
}
exports.Bus = Bus;
//# sourceMappingURL=bus.js.map