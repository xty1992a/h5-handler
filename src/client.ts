// const WebSocket = require('isomorphic-ws');

// import * as WebSocket from 'isomorphic-ws'
import { TinyEmitter } from "tiny-emitter";

class Client extends TinyEmitter {
  ws: WebSocket | undefined;

  start(url: string, key: string) {
    this.ws = new WebSocket(url);
    return this.connect(key);
  }

  connect(key: string) {
    return new Promise<void>(resolve => {
      if (!this.ws) return
      const ws = this.ws;
      ws.onopen = () => {
        console.log("connected");
        this.send('key', {key})
      };

      ws.onmessage = (message) => {
        try {
          const { type } = JSON.parse(message.data);
          if (type !== "connected") return
          this.emit("connected");
          this.listen();
          resolve()
        } catch (e) {
        }
      };
    });
  }

  listen() {
    if (!this.ws) return
    const ws = this.ws;
    ws.onmessage = (message) =>{
      try {
        const { type, ...rest } = JSON.parse(message.data);
        this.emit(type, rest);
      } catch (e) {
      }
      this.emit("message", message.data);
    };
    ws.onclose = function close() {
      console.log("disconnected");
    };
  }

  reply = (type: string, fn: Function) => {
    this.off(type)
    this.on(type, async (e: any) => {
      const result = await fn(e.payload)
      this.send(e.reply, result)
    })
  };

  send(type: string, payload: any) {
    this.ws?.send(JSON.stringify({ type, payload }));
  }

}

async function main() {
  console.log('client start')
  const url = new URL(location.href);
  const search = url.searchParams;

  const socket = search.get("socket");
  const key = search.get("socket_key");

  console.log('socket', socket, key)
  if (!socket || !key) return console.log('no socket')

  console.log('启动socket')
  const client = new Client();
  await client.start(socket, key);

  client.reply('query', (selector: string) => {
    const el = document.querySelector(selector)
    if (!el) {
      console.log('元素不存在')
      return null;
    }
    const rect = el.getBoundingClientRect()
    const text = (el as HTMLDivElement)?.innerText ?? ''
    return { rect, text }
  })

  client.reply('click', (selector: string) => {
    const el = document.querySelector(selector) as HTMLDivElement
    el?.click()
    return 'click:ok'
  })
}

main();
