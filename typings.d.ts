/**
 * 主机信息对象
 */
interface IHost {
  url: string;
  /**
   * 配合web server解决跨域，地址的域信息部分将被替换为客户端地址。
   */
  cors?: boolean;
}
/**
 * 某一个站点配置
 */
interface ISite<T, H extends string> {
  /**
   * 环境标识
   */
  env: T;
  /**
   * 远端服务器配置
   */
  remote: {
    /**
     * 服务器地址列表
     */
    hosts: Record<H, IHost | string>;
    /**
     * 默认协议，服务器地址不设置可继承该设置
     */
    protocol?: string;
  };
  /**
   * 本地服务器配置
   */
  local?: {
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
   * 自定义配置
   */
  custom?: Record<string, any>;
  /**
   * 登录入口
   */
  entrance?: string;
  /**
   * 统计服务地址
   */
  sensor?: string;
}
declare type Env = "DEV" | "SIT" | "UAT" | "PROD";

interface ISiteConfig<T extends string, H extends string> {
  systems: ISite<T, H>[];
  /**
   * 指定运行环境
   */
  runtimes: T;
}

declare function getSiteConfig<
  T extends string,
  H extends string,
>(): ISiteConfig<T, H>;

declare function getSystemConfig<T extends string, H extends string>(): ISite<
  T,
  H
>;
