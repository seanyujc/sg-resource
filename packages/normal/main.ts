import { getRequestURL, loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}

function dealApiKey<M extends string>(
  apiKey: string | { module: M; apiKey: string },
) {
  let key = "";
  let module = "default";
  if (typeof apiKey === "object") {
    key = apiKey.apiKey;
    module = apiKey.module;
  } else {
    key = apiKey;
  }

  return { key, module };
}

function generateGet<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("get", key, module, pathParams);
    return Axios.get(url, { params, headers: options.headers }).then(
      transformResult,
    );
  };
}

function generateDelete<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("delete", key, module, pathParams);
    return Axios.delete(url, { params, headers: options.headers }).then(
      transformResult,
    );
  };
}

function generatePost<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("post", key, module, pathParams);
    return Axios.post(url, params, {
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
      },
    }).then(transformResult);
  };
}

function initInterceptors<T extends any>(options?: InterceptorsOptions<T>) {
  Axios.interceptors.request.use(async (config) => {
    if (options) {
      if (options.headers) {
        const _headers = options.headers();
        config.headers = {
          ...config.headers,
          ..._headers,
        };
      }
      if (options.onRequest) {
        config = await options.onRequest(config);
      }
    }
    console.log(config);

    return config;
  });
  Axios.interceptors.response.use((response) => {
    return new Promise<AxiosResponse<any>>((resolve, reject) => {
      if (options) {
        if (options.diagnoseResponse) {
          options
            .diagnoseResponse(response)
            .then((res) => resolve(res as any))
            .catch(reject);
        } else {
          resolve(response);
        }
      } else {
        resolve(response);
      }
    });
  });
}

export function ensureInitialized<M extends string, T extends any>(
  apiConfig: ApiConfigInfo<string, string>,
  options?: InterceptorsOptions<T>,
) {
  const config = loadConfig(apiConfig);
  initInterceptors<T>(options);
  return { config, get: generateGet<M>(), delete: generateDelete(), post: generatePost<M>() };
}
