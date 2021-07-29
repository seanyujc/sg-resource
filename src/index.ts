import { AxiosResponse } from "axios";
import { ConfigAdapter } from "./config-adapter";
import { createSingletonObject, Autowired } from "./decorator";
import { ProxyHttp } from "./proxy-http";
export interface IHost {
  url: string;
  cors?: boolean;
}
/**
 * 某一个站点配置
 */
export interface ISite {
  /**
   * 环境标识
   */
  env: "DEV" | "SIT" | "UAT" | "PROD";
  /**
   * 远端服务器配置
   */
  remote: {
    /**
     * 服务器地址列表
     */
    hosts: Record<string, IHost | string>;
    /**
     * 默认协议，服务器地址不设置可继承该设置
     */
    protocol?: string;
  };
  /**
   * 本地服务器配置
   */
  local: {
    /**
     * 协议
     */
    protocol?: string;
    /**
     * 主机域名或ip地址
     */
    hostname?: string;
    /**
     * 端口占用
     */
    port?: number;
    /**
     * 发布路径
     */
    publicPath?: string;
    /**
     * 附件路径，可以是本地服务目录，或远程地址
     */
    assetsPath?: string;
  };
  /**
   * 自定义
   */
  custom?: Record<string, any>;
  /**
   * 第三方登录入口
   */
  entrance?: string;
  /**
   * 统计服务地址
   */
  sensor?: string;
  /**
   * 接口加密盐
   */
  salt?: string;
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

export interface ISiteConfig<T = "DEV" | "SIT" | "UAT" | "PROD"> {
  system: ISite[];
  runtime: T;
}

/**
 * 自定义拦截配置
 */
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
export abstract class SGResource {
  static ensureInitialized(
    siteConfig: ISiteConfig<any>,
    apiConfig: IApiConfig,
    options?: IInterceptorsOptions
  ): ProxyHttp {
    const confingAdapter = createSingletonObject<ConfigAdapter>(
      ConfigAdapter,
      siteConfig,
      apiConfig
    );
    return createSingletonObject<ProxyHttp>(ProxyHttp, confingAdapter, options);
  }
}

export { ProxyHttp, createSingletonObject, Autowired };
