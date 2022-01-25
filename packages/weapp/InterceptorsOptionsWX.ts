/// <reference path="../../node_modules/miniprogram-api-typings/types/index.d.ts" />
export class InterceptorsOptionsWX {
  /**
   * 自定义全局请求头
   */
  headers?: () => Record<string, string | null>;
  onRequest?: (
    config: WechatMiniprogram.RequestOption<WechatMiniprogram.IAnyObject>,
  ) => Promise<any>;
  /**
   * 返回值拦截处理
   */
  diagnoseResponse?: (
    config: WechatMiniprogram.RequestSuccessCallbackResult,
  ) => Promise<any>;
}
