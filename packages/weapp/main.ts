// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/miniprogram-api-typings/types/index.d.ts" />
import { dealApiKey, getRequestURL, loadConfig } from "../../lib/common/config";
import type { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { RequestOptionInfo } from "../../lib/domain/RequestOptionInfo";
import type { InterceptorsOptionsWX } from "./InterceptorsOptionsWX";

let interceptorsOptions: InterceptorsOptionsWX | null = null;

function initInterceptors(options?: InterceptorsOptionsWX) {
  if (options) {
    interceptorsOptions = options;
  }
}

function generateRequestMethod<M extends string>(
  method:
    | "OPTIONS"
    | "GET"
    | "HEAD"
    | "POST"
    | "PUT"
    | "DELETE"
    | "TRACE"
    | "CONNECT",
) {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    return new Promise(async (resolve, rejcect) => {
      const { key, module } = dealApiKey(apiKey);
      const { url } = getRequestURL("post", key, module, pathParams);
      const {
        timeout,
        dataType,
        responseType,
        enableHttp2,
        enableQuic,
        enableCache,
        enableHttpDNS,
        httpDNSServiceId,
        enableChunked,
      } = options;
      const globalHeader =
        interceptorsOptions && typeof interceptorsOptions.headers === "function"
          ? interceptorsOptions.headers()
          : {};
      let option: WechatMiniprogram.RequestOption<WechatMiniprogram.IAnyObject> =
        {
          method,
          url,
          data,
          header: { ...globalHeader, ...options.headers },
          success: async (res) => {
            if (
              interceptorsOptions &&
              typeof interceptorsOptions.diagnoseResponse === "function"
            ) {
              const _res = await interceptorsOptions.diagnoseResponse(res);
              resolve(_res);
            } else {
              resolve(res);
            }
          },
          fail: (res) => {
            rejcect(res);
          },
          timeout,
          dataType,
          responseType,
          enableHttp2,
          enableQuic,
          enableCache,
          enableHttpDNS,
          httpDNSServiceId,
        };
      if (
        interceptorsOptions &&
        typeof interceptorsOptions.onRequest === "function"
      ) {
        option = await interceptorsOptions.onRequest(option);
      }
      const task = wx.request(option);
      console.log(task);
    });
  };
}

export function ensureInitialized<M extends string, T extends any>(
  apiConfig: ApiConfigInfo<string, string>,
  options?: InterceptorsOptionsWX,
) {
  const config = loadConfig(apiConfig);
  initInterceptors(options);
  return {
    config,
    get: generateRequestMethod<M>("GET"),
    _delete: generateRequestMethod<M>("DELETE"),
    head: generateRequestMethod<M>("HEAD"),
    post: generateRequestMethod<M>("POST"),
    put: generateRequestMethod<M>("PUT"),
    options: generateRequestMethod<M>("OPTIONS"),
    trace: generateRequestMethod<M>("TRACE"),
    connect: generateRequestMethod<M>("CONNECT"),
  };
}
