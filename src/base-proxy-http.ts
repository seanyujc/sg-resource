import Axios, { AxiosResponse } from "../lib/axios/axios";
import { ConfigAdapter } from "./config-adapter";

export interface IInterceptorsOptions {
  /**
   * 自定义请求头
   */
  headers?: () => Record<string, string | null>;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse?: (config: AxiosResponse<any>) => AxiosResponse<any>;
}

export class BaseProxyHttp {
  constructor(
    protected configAdapter: ConfigAdapter,
    options?: IInterceptorsOptions,
  ) {
    this.initInterceptors(options);
  }
  initInterceptors(options?: IInterceptorsOptions) {
    Axios.interceptors.request.use((config) => {
      let _headers: any = {};
      if (options) {
        if (options.headers) {
          _headers = options.headers();
        }
      }
      config.headers = { ...config.headers, ..._headers };
      return config;
    });
    Axios.interceptors.response.use((config) => {
      if (options) {
        if (options.diagnoseResponse) {
          config = options.diagnoseResponse(config);
        }
      }
      return config;
    });
  }

  /**
   * 代理get请求
   * @param apiKey config定义的接口名
   * @param params 请求参数
   * @param pathParams 路径参数
   * @param options 可选参数，包括请求头参数
   */
  get(
    apiKey: string,
    params?: any,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) {
    const url = this.configAdapter.getRequestUrl("GET", apiKey, pathParams);
    return Axios.get(url, { params, headers: options.headers }).then(
      transformResult,
    );
  }

  /**
   * 代理post请求
   * @param apiKey config定义的接口
   * @param data 请求参数
   * @param pathParams 路径参数
   * @param options 可选参数，包括请求头参数
   */
  post(
    apiKey: string,
    data?: any,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) {
    const url = this.configAdapter.getRequestUrl("POST", apiKey, pathParams);
    return Axios.post(url, data, { headers: options.headers }).then(
      transformResult,
    );
  }

  /**
   * 代理delete请求
   * @param api config定义的接口
   * @param pathParams 请求参数
   */
  delete(
    apiKey: string,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) {
    const url = this.configAdapter.getRequestUrl("POST", apiKey, pathParams);
    return Axios.delete(url, { headers: options.headers }).then(
      transformResult,
    );
  }

  /**
   * 代理put请求
   * @param apiKey config定义的接口名
   * @param data 请求参数
   */
  put(
    apiKey: string,
    data?: any,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) {
    const url = this.configAdapter.getRequestUrl("PUT", apiKey, pathParams);
    return Axios.put(url, data, { headers: options.headers }).then(
      transformResult,
    );
  }
}

export function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}
