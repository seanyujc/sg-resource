# sg-resource

> Front-end network resource management tool.

## Install

```bash
npm i sg-resource
```

## Information management

[demo](https://github.com/seanyujc/sgv-tpl-vite)

### Service site management



```js
// site.config.js
// @ts-check
/// <reference path="../node_modules/sg-resource/typings.d.ts" />
(function() {
  const /** @type {SiteConfig<"DEV" | "SIT" | "UAT" | "PROD", "default">} */ SITE_CONFIG = {
    system: [{
        env: "DEV",
        remote: {
          hosts: {
            user: "http://127.0.0.1:8080/web-api",
          },
        },
        entrance: "",
      },
      {
        env: "SIT",
        remote: {
          hosts: {
            user: "http://127.0.0.1:8080/web-api",
          },
        },
        entrance: "",
      },
    ],
    runtime: "DEV",
  };

  // Export via global get method
  if (typeof window === "object") {
    window.getSiteConfig = () => SITE_CONFIG;
  }
  if (typeof global === "object") {
    global.getSiteConfig = () => SITE_CONFIG;
  }
  if (typeof module === "object") {
    module.exports = {
      SITE_CONFIG,
    };
  }
})();
```

* Details of field configuration

```ts
/**
 * a site configuration
 */
export interface ISite {
  /**
   * Environmental identification
   */
  env: "DEV" | "SIT" | "UAT" | "PROD";
  /**
   * Remote server configuration
   */
  remote: {
    /**
     * List of server addresses
     */
    hosts: Record<string, IHost | string>;
    /**
     * Default protocol, this setting can be inherited if it is not set in the server address
     */
    protocol?: string;
  };
  /**
   * local server configuration
   */
  local: {
    /**
     * protocol
     */
    protocol?: string;
    /**
     * Host domain name or ip address
     */
    hostname?: string;
    /**
     * Port occupation
     */
    port?: number;
    /**
     * release path
     */
    publicPath?: string;
    /**
     * The attachment path, which can be a local service directory, or a remote address
     */
    assetsPath?: string;
  };
  /**
   * customize
   */
  custom?: Record<string, any>;
  /**
   * Third-party login entry address
   */
  entrance?: string;
  /**
   * Statistics service address
   */
  sensor?: string;
}
/**
 * host info object
 * */
interface IHost {
  url: string;
  /**
   * Cooperate with the web server to solve cross-domain, the domain information part of the address will be replaced with the client address.
   */
  cors?: boolean;
}
```

#### # system
* The system field can configure multiple environments (DEV, SIT, UAT, PROD, etc.), the "env" field specifies the environment (required), and the runtime field is used to select one of the environments. Configure multiple service addresses through the hosts dictionary in each environment, and the keys of the hosts dictionary of each environment are consistent.
  
#### # remote

* Type：{ hosts: { [key: string]: string | { url: string; cors?: boolean }}; protocol?: string }
* Description：The remote field is used to configure the access address and first path of the interface server. The hosts field is used to configure a set of host addresses, generally corresponding to a service, the map type, whose key is used to retrieve and identify the host, and the value type can be a string or an object. When a string, it should conform to the URI specification, in the following form:

```
URI = scheme:[//authority]path
```

```
authority = [userinfo@]host[:port]
```

You can leave scheme:[//authority] empty, which means that the client domain name and port are used to resolve CORS.  
When an object, the domain of this address client cors solution can be explicitly marked as deprecated using the cors field. The configured scheme:[//authority] part will be ignored, or not configured directly.  
The protocol field can be optionally set to a global protocol. When this field is set, the protocol part of the url of the host can not be set, and the global protocol will be inherited, such as: "//10.0.0.1:8080/user-api/"

#### # local

* Type：{ protocol?: string; hostname?: string; port?: number; publicPath: string }
* Description：The local field configures the local domain name, port, and publishing directory for the development server or server-side rendering server.

### site.config.js Import method:

1. Introduced as a static resource in CSR

```html
<script src="/site.config.js"></script>
```

2. Modular import in SSR

```js
// commonjs
const {
  SITE_CONFIG
} = require("./config/site.config");
const currentConfig = SITE_CONFIG.system.find(
  (item) => item.env === SITE_CONFIG.runtime,
);
```

```ts
// EMS
import "../config/site.config";
let siteConfig: ISiteConfig = {
  system: [],
  runtime: "DEV",
};

if (getSiteConfig) {
  siteConfig = getSiteConfig();
}

const config = siteConfig.system.find(
  (item) => item.env === siteConfig.runtime,
);
```

### Interface configuration management

Use the host field to select the service target (using generic constraints)

```ts
// api.config.ts
export const apiConfig: IApiConfig<"local"> = {
  post: {
    login: { host: "local", path: "/login" },
  },
  get: {},
};
```

#### Modular Interface Configuration

```ts
// typings.d.ts
declare type HostKeys = "local" | "shanghai";
declare type ModuleKeys = "shanghai";

// api-shanghai.conf.ts
/// <reference path="./typings.d.ts" />
export const apiShanghaiConfig: ApiConfigInfo<HostKeys, ModuleKeys> = {
  post: {
    modifyCountry: {
      path: "/modify_country",
      host: "local",
    },
  },
};
// api.conf.ts
/// <reference path="./typings.d.ts" />
import { apiShanghaiConfig } from "./api-shanghai.conf.ts";
const apiConfig: ApiConfigInfo<HostKeys, ModuleKeys> = {
  post: {
    login: { host: "local", path: "/login" },
  },
  get: {},
  modules: { shanghai: apiShanghaiConfig },
};
```

### Startup and interface calls

Take the EMS export file as an example.

* Use the ensureInitialized method to initialize the http proxy, and you can export proxy methods on demand.

```js
//resource.ts
import {
  ensureInitialized
} from "sg-resource";
import {
  apiConfig
} from "./config/api.conf";
import {
  ACCESS_TOKEN_KEY
} from "./constants";

export const {
  post,
  get,
  _delete
} = ensureInitialized <
  "default",
  any >
  (apiConfig, {
    headers: () => {
      const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      return {
        "access-token": accessToken
      };
    },
    diagnoseResponse: (config) => {
      return new Promise((resolve, reject) => {
        if (config && config.status === 200) {
          if (config.data && config.data.status === 0) {
            config.data = config.data.data;
            resolve(config);
          } else {
            reject(config.data);
          }
        } else {
          resolve(config);
        }
      });
    },
  });
```

```ts
// user.serv.ts
import { post } from "../resource";

function login(userName: string, password: string): Promise<UserInfo> {
  return post("login", { userName, password });
}

function modifyCountry(): Promise<any> {
  return post(
        { apiKey: "modifyCountry", module: "shanghai" }, // shanghai模块中的配置
        { name: "shanghai" },
      )
}

export const userService = { login };
```

### use service

```ts
import { userService } from "./service/user.serv.ts"

userService
  .login("sean", "666666")
  .then((data) => {
    // store info of user and to home
  })
  .catch(console.log);
```

### Add type definitions in tsconfig.json file

```ts
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      "sg-resource/typings"
    ]
  }
}

```

#### request parameter options

* RequestOptionInfo

| Field              | Description                                                                                | Default | Remark     |
| ----------------- | ------------------------------------------------------------------------------------ | ------ | -------- |
| headers           | Add request header information                                                                       | -      |
| cancelLevel       | Abandon the last requested level. 0 none, 1 all, 2 To Domain, 3 to service, 4 to the interface, 5 to parameter, 6 to value | 0      |
