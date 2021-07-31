# sg-resource

> 一个网络资源管理工具。使用 HTTP 协议请求，支持Vue、React，支持 SSR。

## 安装

```bash
npm i sg-resource
```

## 信息管理

### 服务站点管理

* system字段可配置多个环境（DEV、TEST、UAT、PROD等），"env"字段指定环境（必填），使用 runtime 字段选择其中一个环境。在每个环境里通过hosts字典配置多个服务地址，各环境hosts字典的key保持一致。

```js
// site.config.js
(function() {
  const SITE_CONFIG = {
    system: [{
      env: "DEV",
      remote: {
        hosts: {
          user: "http://127.0.0.1:8080/web-api",
        },
      },
      local: {
        port: 3000,
      },
    }, ],
    runtime: "DEV",
  };

  // 通过全局get方法导出
  if (typeof window === "object") {
    window.getSiteConfig = () => SITE_CONFIG;
  }
  if (typeof global === "object") {
    global.getSiteConfig = () => SITE_CONFIG;
  }
  if (typeof module === "object") {
    module.exports = {
      SITE_CONFIG
    };
  }

})()
```

* system元素各字段配置的详情

```ts
/**
 * 某一个站点配置
 */
export interface ISite {
  /**
   * 环境标识
   */
  env: "DEV" | "SIT" | "UAT" | "PROD";
  /**
   * 远端服务器配置
   */
  remote: {
    /**
     * 服务器地址列表
     */
    hosts: Record<string, IHost | string>;
    /**
     * 默认协议，服务器地址中不设置可继承该设置
     */
    protocol?: string;
  };
  /**
   * 本地服务器配置
   */
  local: {
    /**
     * 协议
     */
    protocol?: string;
    /**
     * 主机域名或ip地址
     */
    hostname?: string;
    /**
     * 端口占用
     */
    port?: number;
    /**
     * 发布路径
     */
    publicPath?: string;
    /**
     * 附件路径，可以是本地服务目录，或远程地址
     */
    assetsPath?: string;
  };
  /**
   * 自定义
   */
  custom?: Record<string, any>;
  /**
   * 第三方登录入口
   */
  entrance?: string;
  /**
   * 统计服务地址
   */
  sensor?: string;
  /**
   * 接口加密盐
   */
  salt?: string;
}
/**
 * 主机信息对象
 * */
interface IHost {
  url: string;
  /**
   * 配合web server解决跨域，地址的域信息部分将被替换为客户端地址。
   */
  cors?: boolean;
}
```

* site.config.js引入方式：
1) 在CSR当作静态资源引入

```html
<script src="/public/site.config.js"></script>
```

2) 在SSR模块式引入

```js
// js
const {
  SITE_CONFIG
} = require("./config/site.config");
const currentConfig = SITE_CONFIG.system.find(
  (item) => item.env === SITE_CONFIG.runtime,
);
```

```ts
// ts
import "../config/site.config";
let siteConfig: ISiteConfig = {
  system: [],
  runtime: "DEV"
};

if (getSiteConfig) {
  siteConfig = getSiteConfig();
}

const config = siteConfig.system.find(
  (item) => item.env === siteConfig.runtime,
);

```

### <a name="api_mgt">接口配置管理</a>

使用 host 字段选择服务目标（使用泛型约束）

```ts
// api.config.ts
export const apiConfig: IApiConfig<"user"> = {
  post: {
    login: { host: "user", path: "/login" },
  },
  get: {},
};
```

### 访问接口

创建一个基础类并继承基础类

* 创建基础类在构造方法中调用初始化方法初始化 sg-resource，自定义 ResultInfo 对象用来描述接口返回数据的包装类 

```js
// base.serv.ts
import {
  apiConfig
} from "@/app/config/api.config";
import {
  ISiteConfig,
  ProxyHttp,
  SGResource
} from "sg-resource";
import {
  ResultInfo
} from "../domain/ResultInfo";

export class BaseService {
  proxyHttp: ProxyHttp;
  constructor() {
    let siteConfig: ISiteConfig = {
      system: [],
      runtime: "DEV",
    };
    // 通过全局方法获取服务主机信息
    if (typeof getSiteConfig !== "undefined") {
      siteConfig = getSiteConfig();
    }

    this.proxyHttp = SGResource.ensureInitialized(siteConfig, apiConfig, {
      headers: () => {
        const headers: any = {};
        let token = "88";

        if (token) {
          headers["accessToken"] = token;
        }
        return headers;
      },
      diagnoseResponse: (config) => {
        if (config.data) {
          const result: ResultInfo = config.data;

          if (result.status === 0) {
            config.data = result.data;
          }
        }
        return config;
      },
    });
  }
}
```

* 继承基础类后使用this.proxyHttp对象中的方法得到服务能力，参数apiKey对应<a href="#api_mgt">接口配置管理</a>中的key定义

```ts
// user.serv.ts
import { BaseService } from "./base.serv";

export class UserService extends BaseService {
  constructor() {
    super();
  }
  login(userName: string, password: string): Promise<any> {
    return this.proxyHttp.post("login", { userName, password });
  }
}
```

### 使用service类

```ts
// 在你需要的
const userService = new UserService();
userService.login("sean", "666666").then(data=>{
  // store info of user and to home
}).catch(console.log);
```

### 在ts中你可能需要添加类型定义

```ts
// global.d.ts
import { ISiteConfig } from "sg-resource";

declare global {
  interface Window {
    getSiteConfig?: () => ISiteConfig;
  }
  const getSiteConfig: (() => ISiteConfig) | undefined;  

   namespace NodeJS {
    interface Global {
        getSiteConfig?: () => ISiteConfig;
    }
  }
}

```

## 接口文档

* 主机配置管理
* 接口配置管理
* 初始化方法
* http 请求代理

### 主机配置

#### # remote

* 类型：{ hosts: { [key: string]: string | { url: string; cors?: boolean }}; protocol?: string }
* 详细：remote 用于配置接口服务器的访问地址、首路径。hosts 字段用于配置一组主机地址，一般对应一个服务，map 类型，其 key 用于检索识别主机，value 类型可以是字符串或对象。当为字符串时应符合 URI 规范，形式如下：

```
URI = scheme:[//authority]path
```

```
authority = [userinfo@]host[:port]
```

可以将 authority 置空，仅保留“//”，则表示使用客户端域名和端口，用以解决 CORS。  
当是对象时，可使用 cors 字段明确标记此地址客户端 cors 解决方案为弃用配置的域，改为本地域，url 可写全，在符合规范的前提下 authority 内容可随意填充。  
protocol 字段可选为全局设置协议，当设置了此字段后可以不设置 host 的 url 的协议部分，会继承全局协议，如：“//10.0.0.1:8080/user-api/”

* 示例：

```js
{
  remote: {
    hosts: {
      user: {
        url: "//10.0.0.1:8080/user-api",
        cors: true
      },
      support: "https://10.0.0.1:8080/support-api",
    },
  }
}
```

#### # local

* 类型：{ protocol?: string; hostname?: string; port?: number; publicPath: string }
* 详细：local 为开发服务器或服务器端渲染服务器配置本地域名、端口、发布目录。

### 接口配置

#### # post

* 类型：{ [key: string]: { host: string; path: string } }
* 详细：post 定义为 http 的一组 post 请求。为 map 类型，key 用于检索，value 类型为对象，其 host 字段为主机配置中的 hosts 对象的 key，用于选取接口主机地址；path 字段为此接口服务内部访问路径。
* 示例：

```js
post: {
  login: {
    host: "user",
    path: "/login"
  },
},
```

另有 get、put、delete、form、modules 配置与 post 类似就不做赘述

### 初始化方法

初始化并返回一个 ProxyHttp 对象实例。

#### # SGResource.ensureInitialized(apiConfig: IApiConfig, siteConfig: ISiteConfig, options?: IInterceptorsOptions): ProxyHttp; 

可选项定义：

```js
IInterceptorsOptions {
  /**
   * 自定义请求头
   */
  headers ? : () => Record < string, string | null > ;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse ? : (config: AxiosResponse < any > ) => AxiosResponse < any > ;
}
```

#### ProxyHttp 对象的实例方法：

#### # post(apiKey: string; params?: { [key: string]: string }; pathParams?: string[]; options: { headers?: any } = {})

* 示例：

```js
login(userName: string, password: string): Promise < any > {
  return this.proxyHttp.post("login", {
    userName,
    password
  });
}
```

* 实例方法定义

```ts
/**
 * 代理get请求
 * @param apiKey config定义的接口名
 * @param params 请求参数
 * @param pathParams 路径参数
 * @param options 可选参数，包括请求头参数
 */
get(apiKey: string, params?: any, pathParams?: string[], options?: {
    headers?: any;
}): Promise<any>;
/**
 * 代理post请求
 * @param apiKey config定义的接口
 * @param data 请求参数
 * @param pathParams 路径参数
 * @param options 可选参数，包括请求头参数
 */
post(apiKey: string, data?: any, pathParams?: string[], options?: {
    headers?: any;
}): Promise<any>;
/**
 * 代理delete请求
 * @param api config定义的接口
 * @param pathParams 请求参数
 */
delete(apiKey: string, pathParams?: string[], options?: {
    headers?: any;
}): Promise<any>;
/**
 * 代理put请求
 * @param apiKey config定义的接口名
 * @param data 请求参数
 */
put(apiKey: string, data?: any, pathParams?: string[], options?: {
    headers?: any;
}): Promise<any>;
/**
 * 表单提交
 * @param api 接口
 * @param form 表单对象
 */
form(apiKey: string, form: FormData, pathParams?: string[], options?: {
    headers?: any;
}): Promise<any>;
/**
 * 通过网络协议获取一组文件对象
 * @param urls 文件url列表
 * @param options 可选参数，包括请求头参数
 */
getFiles(urls: string[], options?: {
    headers?: any;
}): Promise<File[]>;

```
