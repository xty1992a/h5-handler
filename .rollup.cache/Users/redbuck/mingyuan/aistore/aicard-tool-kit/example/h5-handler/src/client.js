// const WebSocket = require('isomorphic-ws');
import { __awaiter, __rest } from "tslib";
// import * as WebSocket from 'isomorphic-ws'
import { TinyEmitter } from "tiny-emitter";
class Client extends TinyEmitter {
    constructor() {
        super(...arguments);
        this.reply = (type, fn) => {
            this.off(type);
            this.on(type, (e) => __awaiter(this, void 0, void 0, function* () {
                const result = yield fn(e.payload);
                this.send(e.reply, result);
            }));
        };
    }
    start(url, key) {
        this.ws = new WebSocket(url);
        return this.connect(key);
    }
    connect(key) {
        return new Promise(resolve => {
            if (!this.ws)
                return;
            const ws = this.ws;
            ws.onopen = () => {
                console.log("connected");
                this.send('key', { key });
            };
            ws.onmessage = (message) => {
                try {
                    const { type } = JSON.parse(message.data);
                    if (type !== "connected")
                        return;
                    this.emit("connected");
                    this.listen();
                    resolve();
                }
                catch (e) {
                }
            };
        });
    }
    listen() {
        if (!this.ws)
            return;
        const ws = this.ws;
        ws.onmessage = (message) => {
            try {
                const _a = JSON.parse(message.data), { type } = _a, rest = __rest(_a, ["type"]);
                this.emit(type, rest);
            }
            catch (e) {
            }
            this.emit("message", message.data);
        };
        ws.onclose = function close() {
            console.log("disconnected");
        };
    }
    send(type, payload) {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type, payload }));
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('client start');
        const url = new URL(location.href);
        const search = url.searchParams;
        const socket = search.get("socket");
        const key = search.get("socket_key");
        console.log('socket', socket, key);
        if (!socket || !key)
            return console.log('no socket');
        console.log('启动socket');
        const client = new Client();
        yield client.start(socket, key);
        client.reply('query', (selector) => {
            var _a;
            const el = document.querySelector(selector);
            if (!el) {
                console.log('元素不存在');
                return null;
            }
            const rect = el.getBoundingClientRect();
            const text = (_a = el === null || el === void 0 ? void 0 : el.innerText) !== null && _a !== void 0 ? _a : '';
            return { rect, text };
        });
        client.reply('click', (selector) => {
            const el = document.querySelector(selector);
            el === null || el === void 0 ? void 0 : el.click();
            return 'click:ok';
        });
    });
}
main();
//# sourceMappingURL=client.js.map