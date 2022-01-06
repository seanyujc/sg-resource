/// <reference path="../../node_modules/miniprogram-api-typings/types/index.d.ts" />
import { dealApiKey, getRequestURL, loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";

function initInterceptors(options: any) {}

function generatePost<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    return new Promise((resolve, rejcect) => {
      const { key, module } = dealApiKey(apiKey);
      const url = getRequestURL("post", key, module, pathParams);
      const option: WechatMiniprogram.RequestOption<WechatMiniprogram.IAnyObject> = {
        method: "POST",
        url,
        data,
        header: { ...options.headers },
        success: (res) => {
          resolve(res);
        },
        fail: (res) => {
          rejcect(res);
        },
      };
      const task = wx.request(option);
    });
  };
}

export function ensureInitialized<M extends string, T extends any>(
  apiConfig: ApiConfigInfo<string, string>,
  options?: InterceptorsOptions<T>,
) {
  const config = loadConfig(apiConfig);
  initInterceptors(options);
  return { config, post: generatePost<M>() };
}
