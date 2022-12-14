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
  
  // 0. 处理小程序连接，告知客户端如何连接服务端
  const h5link = '/page/h5?url=' + encodeURIComponent(h5Sever.processLink('http://localhost:8080/hello?world=0'))

  // 1. 用小程序的webview页面打开待测试h5链接
  await miniProgram.reLaunch(h5link);

  // 2. 等待h5连接成功
  await h5Sever.connected();
  
  // 3. 连接成功，页面还需要加载，等待期待的元素渲染完成
  await h5Sever.waitFor("#web-app");
  
  // 4. 获取客户端所在页面的元素并进行操作
  const el = await h5Sever.$("#some-el-id"); // return {payload, click}
  const ok = await el?.click(); // return 'click:ok'
  console.log(el?.payload.text, ok);
 
  // 5. 关闭服务端
  h5Sever.stop();
  await miniProgram.close();
})();

```

### 客户端
在应用入口引入即可。
```javascript
// main.js
import '@redbuck/h5-handler'
```
