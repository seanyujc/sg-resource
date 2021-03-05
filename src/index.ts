/// <reference types="../global-sg" />
import { ConfigAdapter } from "./config-adapter";
import { createSingletonObject, Autowired } from "./decorator";
import { IInterceptorsOptions, ProxyHttp } from "./proxy-http";

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
