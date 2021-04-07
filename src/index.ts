import { IInterceptorsOptions } from "./base-proxy-http";
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
    publicPath: string;
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
/**
 * 四个环境站点配置
 */
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

declare const wx: any;

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
