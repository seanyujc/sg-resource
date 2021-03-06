# sg-resource 
> 一个网络资源管理工具。使用HTTP协议请求，支持Vite、webpack、微信小程序、支持SSR。

## 开始使用

### 安装

```bash
npm i sg-resource
```

### 使用

1. 创建配置站点配置和接口配置文件

- 配置四个环境 DEV、TEST、UAT、PROD，使用 runtimes 字段选择其中一个环境。每个环境可配置多个服务地址。

```js
// site.config.js
(function () {
  var SITE_CONFIG = {
    DEV: {
      remote: {
        hosts: {
          user: { url: "//10.0.0.1:8080/user-api", cors: true },
          support: "https://10.0.0.1:8080/support-api",
        },
        protocol: "http:",
      },
      local: {
        publicPath: "/",
      },
    },
    TEST: {
      remote: {
        hosts: {
          user: { url: "//10.0.0.1:8080/user-api", cors: true },
          support: "https://10.0.0.1:8080/support-api",
        },
        protocol: "http:",
      },
      local: {
        publicPath: "/",
      },
    },
    UAT: {
      remote: {
        hosts: {
          user: { url: "//10.0.0.1:8080/user-api", cors: true },
          support: "https://10.0.0.1:8080/support-api",
        },
        protocol: "http:",
      },
      local: {
        publicPath: "/",
      },
    },
    PROD: {
      remote: {
        hosts: {
          user: { url: "//10.0.0.1:8080/user-api", cors: true },
          support: "https://10.0.0.1:8080/support-api",
        },
        protocol: "https:",
      },
      local: {
        publicPath: "/",
      },
    },
    runtimes: "DEV",
  };
  if (typeof window === "object") {
    window.getSiteConfig = () => SITE_CONFIG;
  }
})();
```

- 服务内接口列表配置，使用 host 字段选择目标服务。

```ts
// api.config.ts
export const apiConfig: IApiConfig<"support" | "user"> = {
  post: {
    login: { host: "user", path: "/login" },
  },
  get: {},
};
```

2. 创建一个基础类并继承基础类

- 创建基础类在构造方法中调用初始化方法初始化 sg-resource。

```js
// base.serv.ts
import { apiConfig } from "./api.config.ts";
import { SGResource } from "sg-resource";

export class BaseService {
  proxyHttp: ProxyHttp;
  constructor() {
    this.proxyHttp = SGResource.ensureInitialized(
      apiConfig,
      window.getSiteConfig(),
      {
        headers: () => {
          const headers: any = {};
          const token = localStorage.getItem(HEADER_TOKEN) || "";
          if (token) {
            headers["access-token"] = token;
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
      }
    );
  }
}
```

- 继承基础类

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

## 接口文档

- 主机配置管理
- 接口配置管理
- 初始化方法
- http 请求代理

### 主机配置

#### # remote

- 类型：{ hosts: { [key: string]: string | { url: string; cors?: boolean }}; protocol?: string }
- 详细：remote 用于配置接口服务器的访问地址、首路径。hosts 字段用于配置一组主机地址，一般对应一个服务，map 类型，其 key 用于检索识别主机，value 类型可以是字符串或对象。当为字符串时应符合 URI 规范，形式如下：

```
URI = scheme:[//authority]path
```

```
authority = [userinfo@]host[:port]
```

可以将 authority 置空，仅保留“//”，则表示使用客户端域名和端口，用以解决 CORS。  
当是对象时，可使用 cors 字段明确标记此地址客户端 cors 解决方案为弃用配置的域，改为本地域，url 可写全，在符合规范的前提下 authority 内容可随意填充。  
protocol 字段可选为全局设置协议，当设置了此字段后可以不设置 host 的 url 的协议部分，会继承全局协议，如：“//10.0.0.1:8080/user-api/”

- 示例：

```js
{
    remote: {
        hosts: {
            user: { url: "//10.0.0.1:8080/user-api", cors: true },
            support: "https://10.0.0.1:8080/support-api",
        },
    }
}
```

#### # local

- 类型：{ protocol?: string; hostname?: string; port?: number; publicPath: string }
- 详细：local 为开发服务器或服务器端渲染服务器配置本地域名、端口、发布目录。

### 接口配置

#### # post

- 类型：{ [key: string]: { host: string; path: string } }
- 详细：post 定义为 http 的一组 post 请求。为 map 类型，key 用于检索，value 类型为对象，其 host 字段为主机配置中的 hosts 对象的 key，用于选取接口主机地址；path 字段为此接口服务内部访问路径。
- 示例：

```js
post: {
    login: { host: "user", path: "/login" },
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
  headers?: () => Record<string, string | null>;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse?: (config: AxiosResponse<any>) => AxiosResponse<any>;
}
```

#### ProxyHttp 对象的实例方法：

#### # post(apiKey: string; params?: { [key: string]: string }; pathParams?: string[]; options: { headers?: any } = {})

- 示例：

```js
login(userName: string, password: string): Promise<any> {
    return this.proxyHttp.post("login", { userName, password });
}
```
- 实例方法定义
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
