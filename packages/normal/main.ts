import { dealApiKey, getRequestURL, loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
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

function generateHead<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("head", key, module, pathParams);
    return Axios.head(url, { params, headers: options.headers });
  };
}

function generatePostPut<M extends string>(method: "post" | "put" | "patch") {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL(method, key, module, pathParams);
    return Axios[method](url, data, {
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
      },
    }).then(transformResult);
  };
}

function generateForm<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    form: FormData,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("post", key, module, pathParams);
    return Axios.post(url, form, {
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
      },
    }).then(transformResult);
  };
}

function generateOptions<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options: { headers?: any } = {},
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const url = getRequestURL("options", key, module, pathParams);
    return Axios.options(url, {
      data,
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
      },
    });
  };
}

function initInterceptors<T extends any>(options?: InterceptorsOptions<T>) {
  Axios.interceptors.request.use(async (config) => {
    if (options) {
      if (typeof options.headers === "function") {
        const _headers = options.headers();
        config.headers = {
          ...config.headers,
          ..._headers,
        };
      }
      if (typeof options.onRequest === "function") {
        config = await options.onRequest(config);
      }
    }
    console.log(config);

    return config;
  });
  Axios.interceptors.response.use((response) => {
    return new Promise<AxiosResponse<any>>((resolve, reject) => {
      if (options) {
        if (typeof options.diagnoseResponse === "function") {
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
  return {
    config,
    get: generateGet<M>(),
    _delete: generateDelete<M>(),
    head: generateHead<M>(),
    post: generatePostPut<M>("post"),
    put: generatePostPut<M>("put"),
    patch: generatePostPut<M>("patch"),
    form: generateForm<M>(),
    options: generateOptions<M>(),
  };
}
