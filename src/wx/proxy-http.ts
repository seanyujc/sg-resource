import { BaseProxyHttp, IInterceptorsOptions } from "@/base-proxy-http";
import { ConfigAdapter } from "@/config-adapter";

export class ProxyHttp extends BaseProxyHttp {
    constructor(
      protected configAdapter: ConfigAdapter,
      options?: IInterceptorsOptions,
    ) {
      super(configAdapter, options)
    }
}