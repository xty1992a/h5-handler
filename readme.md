## 简介
一个用于辅助`miniprogram-automator`的web操作库。  
解决了小程序自动化测试中，无法操作小程序内嵌h5页面的问题。  
基于websocket，在测试用例中，创建服务端。  
在待测试的h5页面，引入客户端。  


## 安装
```bash
npm install @redbuck/h5-handler
```

## 使用
### 测试用例(node端)
api设计接近`miniprogram-automator`  
```javascript
const automator = require("miniprogram-automator");
const path = require("path");
const { URL } = require("url");
const assets = (_path) => path.resolve(__dirname, _path);
const H5Handler = require("@redbuck/h5-handler/server").default;
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const SOCKET_CONFIG = {
    port: 5001,
    key: "testing"
  }

;(async () => {
  const miniProgram = await automator.launch({
    projectPath: "to/path/projectPath"
  });
  const h5Sever = new H5Handler(SOCKET_CONFIG);
  h5Sever.listen();
  const h5link = mkH5Link({ 
    ...SOCKET_CONFIG, 
    // 待测试h5地址
    link: "http://localhost:8080/hello?world=0"
  });

  // 1. 用小程序的webview页面打开待测试h5链接
  await miniProgram.reLaunch(h5link);

  // 2. 等待h5连接成功
  await h5Sever.connected();
  // 3. 连接成功，页面还需要加载，等待期待的元素渲染完成
  await h5Sever.waitFor("#web-app");
  // 4. 一顿模拟操作，将会打开小程序页面
  const el = await h5Sever.$("#some-el-id");
  const ok = await el?.click();
  console.log(el?.payload.text, ok);
 
  // 5. 关闭服务端
  h5Sever.stop();
  await miniProgram.close();
})();

//# region helper

function mkH5Link({ port, key, link }) {
  const query = new URLSearchParams();
  const url = new URL(link);
  // 客户端连接标识
  url.searchParams.set("socket", `ws://localhost:${port}`);
  url.searchParams.set("socket_key", key);
  query.set("url", url.toString());

  return `/page/h5?${query.toString()}`;
}

//# endregion
```

### 客户端
在应用入口引入即可。
```javascript
// main.js
import '@redbuck/h5-handler'
```
