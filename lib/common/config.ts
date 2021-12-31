/// <reference types="../../packages/typings" />

import { ApiConfigInfo, IApiConfigInfo, Method } from "../domain/ApiConfigInfo";

let systemConfig: ISite<string, string> | null = null;

type APIModules = {
  [key: string]: IApiConfigInfo<string>;
  default: IApiConfigInfo<string>;
};

let apiConfigModules: APIModules | null = null;

export function loadConfig(_apiConfig: ApiConfigInfo<string, string>) {
  apiConfigModules = { default: _apiConfig, ..._apiConfig.modules };
  if (systemConfig == null) {
    let siteConfig: ISiteConfig<string, string> = {
      systems: [],
      runtimes: "",
    };

    if (typeof getSiteConfig === "function") {
      siteConfig = getSiteConfig();
    }
    systemConfig =
      siteConfig.systems.find((system) => system.env === siteConfig.runtimes) ||
      siteConfig.systems[0];
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
                    apiInfo.path = host + apiInfo.path;
                  } else {
                    apiInfo.path = host.url + apiInfo.path;
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

export function getRequestURL(
  method: Method,
  apiKey: string,
  module: string = "default",
  pathParams: string[] = [],
) {
  let path = "";
  if (systemConfig != null && apiConfigModules != null) {
    const apiConfig = apiConfigModules[module];
    const apiOfMethod = apiConfig[method];
    if (apiOfMethod) {
      const api = apiOfMethod[apiKey];
      if (api) {
        pathParams.unshift(apiOfMethod[apiKey].path);
        path = pathParams.join("/");
      } else {
        throw new Error("No related configuration found");
      }
    }
  }
  return path;
}
