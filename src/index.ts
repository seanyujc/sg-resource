import { ConfigAdapter } from "./config-adapter";
import { createSingletonObject } from "./decorator";
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

export { ProxyHttp };
