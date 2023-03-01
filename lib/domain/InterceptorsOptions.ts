import type { AxiosRequestConfig, AxiosResponse } from "axios";

export class InterceptorsOptions<T extends any> {
  /**
   * 自定义请求头
   */
  headers?: () => Record<string, string | null>;
  onRequest?: (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse?: (config: AxiosResponse<T>) => Promise<AxiosResponse<T>>;
}
