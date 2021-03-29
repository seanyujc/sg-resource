import Axios, { AxiosResponse } from "../lib/axios/axios";
import { BaseProxyHttp, IInterceptorsOptions, transformResult } from "./base-proxy-http";
import { ConfigAdapter } from "./config-adapter";

export class ProxyHttp extends BaseProxyHttp {
  constructor(
    protected configAdapter: ConfigAdapter,
    options?: IInterceptorsOptions,
  ) {
    super(configAdapter, options)
  }

  /**
   * 表单提交
   * @param api 接口
   * @param form 表单对象
   */
  form(
    apiKey: string,
    form: FormData,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) {
    const url = this.configAdapter.getRequestUrl("POST", apiKey, pathParams);
    let headers = { "Content-Type": undefined };
    if (options && options.headers) {
      headers = { ...options.headers, ...headers };
    }
    return Axios.post(url, form, {
      headers,
    }).then(transformResult);
  }

  /**
   * 通过网络协议获取一组文件对象
   * @param urls 文件url列表
   * @param options 可选参数，包括请求头参数
   */
  getFiles(urls: string[], options: { headers?: any } = {}) {
    const promiseAll: Promise<File>[] = [];
    for (const url of urls) {
      promiseAll.push(
        Axios.get(url, { responseType: "blob", headers: options.headers }),
      );
    }
    return Promise.all(promiseAll);
  }
}
