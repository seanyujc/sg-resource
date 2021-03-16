
import { ConfigAdapter } from "./config-adapter";
import { createSingletonObject, Autowired } from "./decorator";
import { IInterceptorsOptions, ProxyHttp } from "./proxy-http";

export interface IHost {
  url: string;
  cors?: boolean;
}
export interface ISite {
  remote: {
    hosts: Record<string, IHost | string>;
    protocol?: string;
  };
  local: {
    protocol?: string;
    hostname?: string;
    port?: number;
    publicPath: string;
    assetsPath?: string;
  };
  entrance?: string;
  sensor?: string;
}
export interface ISiteConfig {
  DEV: ISite;
  TEST: ISite;
  UAT: ISite;
  PROD: ISite;
  runtimes: "DEV" | "TEST" | "UAT" | "PROD";
}

export interface IApi<T = string> {
  host: T;
  path: string;
}

export interface IApiConfig<T = string> {
  post: Record<string, IApi<T>>;
  get: Record<string, IApi<T>>;
  put?: Record<string, IApi<T>>;
  delete?: Record<string, IApi<T>>;
  form?: Record<string, IApi<T>>;
  modules?: Record<string, IApiConfig>;
}
declare const __sg_site_config__: ISiteConfig;

export abstract class SGResource {
  static ensureInitialized(
    apiConfig: IApiConfig,
    siteConfig: ISiteConfig,
    options?: IInterceptorsOptions
  ) {
    const confingAdapter = createSingletonObject<ConfigAdapter>(
      ConfigAdapter,
      apiConfig,
      siteConfig
    );
    return createSingletonObject<ProxyHttp>(ProxyHttp, confingAdapter, options);
  }
}

export { ProxyHttp, createSingletonObject, Autowired };
