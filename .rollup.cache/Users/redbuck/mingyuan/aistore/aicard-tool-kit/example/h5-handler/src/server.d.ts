import { WebSocket, WebSocketServer } from "ws";
interface Option {
    port: number;
    key: string;
}
declare class Server {
    server: WebSocketServer | undefined;
    socket: WebSocket | undefined;
    timeout: number;
    readyQueue: Function[];
    option: Option;
    constructor(option: Option);
    processLink(link: string): any;
    /**
     * 启动ws服务器
     * */
    start({ port, key }: Option): void;
    /**
     * 关闭ws服务器
     * */
    stop(): void;
    /**
     * @description 启动监听，必须在客户端之前调用
     * 随后可以await connected()确保客户端连接成功
     * 一次只接受一个客户端连接
     * @return void
     * */
    listen: () => void;
    /**
     * @description 等待客户端连接成功(可多次调用，全部将得到通知)
     * @return Promise<void>
     * */
    connected: () => Promise<unknown>;
    /**
     * @description 关闭连接（此后可以重新listen，等待新的客户端连接）
     * @return void
     * */
    unListen: () => void;
    /**
     * @description 发送一个消息到客户端
     * @param type 关键字
     * @param payload 载荷
     * @param extra 不放在载荷里的额外字段
     * */
    send(type: string, payload: any, extra?: Record<string, any>): void;
    /**
     * @description 询问页面一些事情，type区分类型，payload为特定类型的线索
     * @param type 关键字
     * @param payload 载荷
     * @param timeout 超时时长，超时将直接resolve null
     * @return Promise<any | null>
     * */
    request(type: string, payload: any, timeout?: number): Promise<unknown>;
    /**
     * @description 等待页面出现某个元素，或等待一段时间；
     *
     * @param selectorOrTime 选择器或时间
     * @param step 传递选择器时，会轮询选择器，此字段为轮询间隔
     * @return Promise<void>
     * */
    waitFor(selectorOrTime: string | number, step?: number): Promise<unknown>;
    /**
     * @description 选择页面上的某个元素
     * @param selector css选择器，支持所有web选择器
     * @return Promise<{payload: {rect: DOMRect, text: String}, click: () => void} | null>
     * */
    $(selector: string): Promise<unknown>;
}
export default Server;
