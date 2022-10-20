import { __awaiter } from "tslib";
import { WebSocketServer } from "ws";
// import {EventEmitter} from 'events'
// import { URL } from "url";
const sleep = (time) => new Promise(resolve => setTimeout(resolve, time));
const rdm = () => Math.random().toString(36).substr(2, 15);
const { URL } = require('url');
const { EventEmitter } = require('events');
const event = new EventEmitter();
class Server {
    constructor(option) {
        this.timeout = 3000;
        this.readyQueue = [];
        this.option = {
            port: 0,
            key: ''
        };
        /**
         * @description 启动监听，必须在客户端之前调用
         * 随后可以await connected()确保客户端连接成功
         * 一次只接受一个客户端连接
         * @return void
         * */
        this.listen = () => {
            if (!this.server)
                return;
            const wss = this.server;
            console.log('server await client connecting...');
            console.log();
            console.log();
            const connection = (ws) => {
                console.log("server connect new client");
                ws.once("message", (data) => {
                    try {
                        const { payload, type } = JSON.parse(data.toString());
                        console.log("client connect by ", type, payload.key, this.option.key);
                        if (type !== "key" && payload.key !== this.option.key)
                            return;
                        connect();
                    }
                    catch (e) {
                    }
                });
                const connect = () => {
                    this.readyQueue.forEach(fn => fn());
                    this.readyQueue = [];
                    console.log("client key ok, start service...");
                    console.log();
                    ws.on("message", function message(data) {
                        try {
                            const { payload, type } = JSON.parse(data.toString());
                            event.emit(type, payload);
                        }
                        catch (e) {
                        }
                        // console.log('received %s', data)
                        event.emit("received", data);
                    });
                    this.socket = ws;
                    this.send("connected", {});
                };
            };
            wss.once("connection", connection);
        };
        /**
         * @description 等待客户端连接成功(可多次调用，全部将得到通知)
         * @return Promise<void>
         * */
        this.connected = () => new Promise(resolve => {
            this.readyQueue.push(resolve);
        });
        /**
         * @description 关闭连接（此后可以重新listen，等待新的客户端连接）
         * @return void
         * */
        this.unListen = () => {
            console.log('disconnect client');
            console.log();
            console.log();
            this.readyQueue = [];
            this.socket = undefined;
        };
        option && this.start(option);
    }
    processLink(link) {
        const url = new URL(link);
        const { port, key } = this.option;
        url.searchParams.set("socket", `ws://localhost:${port}`);
        url.searchParams.set("socket_key", key);
        return url.toString();
    }
    /**
     * 启动ws服务器
     * */
    start({ port, key }) {
        this.server = new WebSocketServer({ port });
        this.option = { port, key };
        console.log("server starts on ws://localhost:" + port);
        console.log();
        console.log();
    }
    /**
     * 关闭ws服务器
     * */
    stop() {
        var _a;
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.close();
        this.server = undefined;
        this.socket = undefined;
        console.log();
        console.log('sever stop');
        console.log('see u next time~');
        console.log();
        console.log();
    }
    /**
     * @description 发送一个消息到客户端
     * @param type 关键字
     * @param payload 载荷
     * @param extra 不放在载荷里的额外字段
     * */
    send(type, payload, extra = {}) {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(Object.assign({ type, payload }, extra)));
    }
    /**
     * @description 询问页面一些事情，type区分类型，payload为特定类型的线索
     * @param type 关键字
     * @param payload 载荷
     * @param timeout 超时时长，超时将直接resolve null
     * @return Promise<any | null>
     * */
    request(type, payload, timeout = this.timeout) {
        return new Promise(resolve => {
            const reply = rdm();
            const timer = setTimeout(() => {
                console.log("ask ", type, "超时未返回，自动拒绝", timeout);
                event.emit(reply, null);
            }, timeout);
            event.once(reply, (e) => {
                clearTimeout(timer);
                resolve(e);
            });
            this.send(type, payload, { reply });
        });
    }
    /**
     * @description 等待页面出现某个元素，或等待一段时间；
     *
     * @param selectorOrTime 选择器或时间
     * @param step 传递选择器时，会轮询选择器，此字段为轮询间隔
     * @return Promise<void>
     * */
    waitFor(selectorOrTime, step = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof selectorOrTime === "number")
                return sleep(selectorOrTime);
            let timer = 0;
            while (1) {
                if (yield this.$(selectorOrTime))
                    return;
                timer++;
                yield sleep(step);
                // console.log("waiting...", timer);
            }
        });
    }
    /**
     * @description 选择页面上的某个元素
     * @param selector css选择器，支持所有web选择器
     * @return Promise<{payload: {rect: DOMRect, text: String}, click: () => void} | null>
     * */
    $(selector) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            // this.send('query', {selector, key: rdm() })
            const payload = yield this.request("query", selector);
            if (!payload)
                return resolve(null);
            resolve({
                click: () => this.request("click", selector),
                payload
            });
        }));
    }
}
export default Server;
//# sourceMappingURL=server.js.map