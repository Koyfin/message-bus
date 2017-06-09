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
const events_2 = require("./events");
class ResponderBuilder extends events_1.EventEmitter {
    constructor(bus, key) {
        super();
        this.bus = bus;
        this._key = key;
        this.createEventEmitter();
    }
    key(key) {
        if (key === undefined)
            return this._key;
        this._key = key;
        return this;
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subscriptionId = yield this.bus.subscribe(this._key, this.eventEmitter, true);
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
        this.eventEmitter.on(events_2.Events.MESSAGE, (message, content) => {
            this.emit(events_2.Events.REQUEST, message, content, (res) => this.bus.respond(res, message));
        });
        this.eventEmitter.on(events_2.Events.ERROR, (error) => this.emit(events_2.Events.ERROR, error));
    }
}
exports.default = ResponderBuilder;
//# sourceMappingURL=responderBuilder.js.map