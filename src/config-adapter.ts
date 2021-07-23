import { Method } from "../lib/axios/axios";
import { IApi, IApiConfig, ISite, ISiteConfig } from "./index";

export class Site implements ISite {
  env: "DEV" | "SIT" | "UAT" | "PROD" = "DEV";
  remote = {
    hosts: {},
  };
  local = { publicPath: "" };
}

export class ConfigAdapter {
  siteInfo: ISite | undefined;
  constructor(private siteConfig: ISiteConfig, private apiConfig: IApiConfig) {
    this.siteInfo = siteConfig.find((ele) => ele.runtimes) || new Site();
  }

  getRequestUrl(method: Method, apiKey: string, pathParams: string[] = []) {
    if (!this.siteInfo) {
      return apiKey;
    }

    let url = "";
    // let host: IHost;
    let path = "";
    let _apiKey = apiKey;
    const keys = apiKey.split("/");
    let module = this.apiConfig;
    if (keys.length > 1) {
      let _module: IApiConfig<string> | undefined = undefined;
      if (this.apiConfig.modules) {
        _module = this.apiConfig.modules[keys[0]];
      }
      if (_module) {
        _apiKey = keys[1];
        module = _module;
      } else {
        return apiKey;
      }
    }
    const methodKey = method.toLocaleLowerCase();
    const config: Record<string, IApi> | undefined = (module as any)[methodKey];
    if (config) {
      const apiPath: IApi | undefined = config[_apiKey];
      if (apiPath) {
        const host = this.siteInfo.remote.hosts[apiPath.host];

        if (host) {
          let cors;
          // string or object
          if (typeof host === "string") {
            url = host;
            cors = url.match(/(:\/\/|^\/\/)([^\/]+)/) == null;
          } else if (typeof host === "object") {
            url = host.url;
            cors = host.cors;
          }
          // cors on client
          if (cors && typeof location === "object") {
            url = url.replace(/\/\/([^\/]*)/, "//" + location.host);
          }
          // include protocol
          if (url.match(/^[^\/]+/) == null && this.siteInfo.remote.protocol) {
            url = this.siteInfo.remote.protocol + url;
          }
        }

        path = apiPath.path;
      }
    }

    pathParams.unshift(path);

    return url + pathParams.join("/");
  }
}
