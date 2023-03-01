/// <reference types="../../typings" />
import type { ApiConfigInfo, Method } from "../domain/ApiConfigInfo";
import { RequestURIInfo } from "../domain/RequestURIInfo";
import md5 from "md5";
import { RequestSignalInfo } from "../domain/RequestSignalInfo";

let systemConfig: ISite<string, string> | null = null;

type APIModules = {
  [key: string]: ApiConfigInfo<string, string>;
  default: ApiConfigInfo<string, string>;
};

let apiConfigModules: APIModules | null = null;

export function setSystemConfig<T extends string, H extends string>(
  config: ISite<T, H>,
) {
  if (systemConfig == null) {
    systemConfig = config;
  }
}

export function loadConfig(_apiConfig: ApiConfigInfo<string, string>) {
  apiConfigModules = { default: _apiConfig, ..._apiConfig.modules };
  let siteConfig: ISiteConfig<string, string> = {
    systems: [],
    runtimes: "",
  };
  if (systemConfig == null) {
    if (typeof getSiteConfig === "function") {
      siteConfig = getSiteConfig();
      systemConfig =
        siteConfig.systems.find(
          (system) => system.env === siteConfig.runtimes,
        ) || siteConfig.systems[0];
    } else if (typeof getSystemConfig === "function") {
      systemConfig = getSystemConfig();
    }
  }
  if (systemConfig) {
    for (const key in apiConfigModules) {
      if (Object.prototype.hasOwnProperty.call(apiConfigModules, key)) {
        const apiConfig = apiConfigModules[key];
        for (const methodKey in apiConfig) {
          if (
            Object.prototype.hasOwnProperty.call(apiConfig, methodKey) &&
            methodKey !== "modules"
          ) {
            const apiMap = apiConfig[methodKey as Method];
            if (apiMap) {
              for (const apiKey in apiMap) {
                if (Object.prototype.hasOwnProperty.call(apiMap, apiKey)) {
                  const apiInfo = apiMap[apiKey];
                  const host = systemConfig.remote.hosts[apiInfo.host];
                  if (typeof host === "string") {
                    apiInfo.url = host + apiInfo.path;
                    apiInfo.hostUrl = host;
                  } else {
                    apiInfo.url = host.url + apiInfo.path;
                    apiInfo.hostUrl = host.url;
                    if (host.cors && typeof location === "object") {
                      apiInfo.path = apiInfo.path.replace(
                        /\/\/([^\/]*)/,
                        "//" + location.host,
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { systemConfig, apiConfigModules };
}

export function dealApiKey<M extends string>(
  apiKey: string | { module: M; apiKey: string },
) {
  let key = "";
  let module = "default";
  if (typeof apiKey === "object") {
    key = apiKey.apiKey;
    module = apiKey.module;
  } else {
    key = apiKey;
  }

  return { key, module };
}

export function getRequestURL(
  method: Method,
  apiKey: string,
  module = "default",
  pathParams: string[] = [],
) {
  const resInfo = new RequestURIInfo();
  if (systemConfig != null && apiConfigModules != null) {
    const apiConfig = apiConfigModules[module];
    const apiOfMethod = apiConfig[method];
    if (apiOfMethod) {
      const apiInfo = apiOfMethod[apiKey];
      if (apiInfo && apiInfo.url) {
        pathParams.unshift(apiInfo.url);
        resInfo.path = apiInfo.path;
        resInfo.hostUrl = apiInfo.hostUrl || "";
        resInfo.host = resInfo.hostUrl.replace(/(http(s)*:\/\/[^/]+)/, "");
        resInfo.url = pathParams.join("/");
        resInfo.pathParams = pathParams;
        const domain = resInfo.hostUrl.match(/(http(s)*:\/\/[^/]+)/);
        if (domain != null) {
          resInfo.domain = domain[0];
        }
      } else {
        throw new Error("No related configuration found");
      }
    }
  }
  return resInfo;
}

/**
 * 生成请求签名
 * @param requestURL
 * @param data
 * @param level 全局、域、主机、接口、参数
 */
export function generateRequestSignal(
  requestURI: RequestURIInfo,
  level: 1 | 2 | 3 | 4 | 5 | 6,
  data?: Record<string, any>,
) {
  console.log(requestURI);

  const signalList: string[] = [];
  const dataSignal: string[] = [];
  switch (level) {
    case 6:
      if (requestURI.pathParams.length) {
        dataSignal.concat(requestURI.pathParams);
      }
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (typeof value === "object") {
            dataSignal.push(md5(JSON.stringify(value)));
          } else if (typeof value === "string" && value.length > 255) {
            dataSignal.push(md5(value));
          } else {
            dataSignal.push(value);
          }
        }
      }
      const values = dataSignal.join("/");
      signalList.unshift(values);
    case 5:
      dataSignal.length = 0;
      if (data) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            dataSignal.push(key);
          }
        }
      }
      const keys = dataSignal.join("/");
      signalList.unshift(keys);
    case 4:
      signalList.unshift(requestURI.path);
    case 3:
      signalList.unshift(requestURI.host);
    case 2:
      signalList.unshift(requestURI.domain);
    case 1:
      signalList.unshift("global");
    default:
      break;
  }
  const signal = signalList.join("|");

  return new RequestSignalInfo(signalList, signal, md5(signal));
}
