import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ConfigAdapter } from "./config-adapter";
export interface IInterceptorsOptions {
  /**
   * 自定义请求头
   */
  headers?: () => Record<string, string | null>;
  onRequest?: (config: AxiosRequestConfig) => void;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse?: <T = any>(config: AxiosResponse<T>) => AxiosResponse<T>;
}
export class ProxyHttp {
  constructor(
    protected configAdapter: ConfigAdapter,
    options?: IInterceptorsOptions,
  ) {
    this.initInterceptors(options);
  }
  initInterceptors(options?: IInterceptorsOptions) {
    Axios.interceptors.request.use((config) => {
      let _headers = {} as any;
      if (options) {
        if (options.headers) {
          _headers = options.headers();
        }
        if (options.onRequest) {
          options.onRequest(config);
        }
      }
      config.headers = { ...config.headers, ..._headers };
      if (process.env.NODE_LOG === "open") {
        console.log(
          "发起请求：\n",
          "----------------------start---------------------\n",
          config,
          "\n---------------------end------------------------",
        );
      }
      return config;
    });
    Axios.interceptors.response.use((response) => {
      if (process.env.NODE_LOG === "open") {
        console.log(
          "返回结果：\n",
          "----------------------start---------------------\n",
          response,
          "\n---------------------end------------------------",
        );
      }
      if (options) {
        if (options.diagnoseResponse) {
          response = options.diagnoseResponse(response);
        }
      }
      return response;
    });
  }

  /**
   * 代理get请求
   * @param apiKey IApiConfig.get[apiKey],定义接口Key
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
   * @param apiKey IApiConfig.get[apiKey],定义接口Key
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
   * @param api IApiConfig.get[apiKey],定义接口Key
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
   * @param apiKey IApiConfig.get[apiKey],定义接口Key
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
   * @param apiKey IApiConfig.get[apiKey],定义接口Key
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
export function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}
