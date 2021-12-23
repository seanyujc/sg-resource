/// <reference types="../../packages/typings" />

import { Method } from "axios";
import { ApiConfigInfo } from "../domain/ApiConfigInfo";

let systemConfig: ISite<string, string> | null = null;
let apiConfig: ApiConfigInfo<string> | null = null;

export function loadConfig(_apiConfig: ApiConfigInfo<string>) {
  apiConfig = _apiConfig;
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
  }
  return { systemConfig, apiConfig };
}

export function getRequestURL(
  method: Method,
  apiKey: string,
  pathParams: string[] = [],
) {
  if (systemConfig != null && apiConfig != null) {
    
  }
}
