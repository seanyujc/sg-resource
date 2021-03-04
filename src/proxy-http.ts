import Axios, { AxiosResponse } from "../lib/axios/axios";
import { ConfigAdapter } from "./config-adapter";

export interface IInterceptorsOptions {
  headers?: () => Record<string, string | null>;
  diagnoseResponse?: (config: AxiosResponse<any>) => AxiosResponse<any>;
}

export class ProxyHttp {
  constructor(
    private configAdapter: ConfigAdapter,
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

function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}
