import {
  dealApiKey,
  generateRequestSignal,
  getRequestURL,
  loadConfig,
} from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";
import Axios, {
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";
import { RequestOptionInfo } from "../../lib/domain/RequestOptionInfo";
import { RequestSignalInfo } from "../../lib/domain/RequestSignalInfo";
import { RequestURIInfo } from "../../lib/domain/RequestURIInfo";

const CancelToken = Axios.CancelToken;
const RequestingSignalList: RequestSignalInfo[] = [];

function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}

function getCancelSource(
  requestURI: RequestURIInfo,
  options: RequestOptionInfo,
  data?: Record<string, any>,
) {
  if (options.cancelLevel) {
    const requestSignal = generateRequestSignal(requestURI, options.cancelLevel, data);
    const res = RequestingSignalList.find(
      (item) => item.key === requestSignal.key,
    );
    if (res && res.source) {
      res.source.cancel();
    } else {
      requestSignal.source = CancelToken.source();
      RequestingSignalList.push(requestSignal);
    }
    console.log(requestSignal);
    
    return requestSignal;
  }
}

function generateGet<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL("get", key, module, pathParams);
    const requestSignal = getCancelSource(
      requestURI,
      options,
      params,
    );
    return Axios.get(requestURI.url, {
      params,
      data: { _requestURI: requestURI },
      headers: options.headers,
      cancelToken:
        requestSignal && requestSignal.source
          ? requestSignal.source.token
          : undefined,
    }).then(transformResult, (error) => {
      if (Axios.isCancel(error)) {
        console.log("Request canceled");
      } else {
       return Promise.reject(error);
      }
    });
  };
}

function generateDelete<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL("delete", key, module, pathParams);
    const requestSignal = getCancelSource(
      requestURI,
      options,
      params,
    );
    return Axios.delete(requestURI.url, {
      params,
      headers: options.headers,
      cancelToken:
        requestSignal && requestSignal.source
          ? requestSignal.source.token
          : undefined,
    }).then(transformResult);
  };
}

function generateHead<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    params?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL("head", key, module, pathParams);
    const requestSignal = getCancelSource(
      requestURI,
      options,
      params,
    );
    return Axios.head(requestURI.url, {
      params,
      headers: options.headers,
      cancelToken:
        requestSignal && requestSignal.source
          ? requestSignal.source.token
          : undefined,
    });
  };
}

function generatePostPutPatch<M extends string>(
  method: "post" | "put" | "patch",
) {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL(method, key, module, pathParams);
    const requestSignal = getCancelSource(
      requestURI,
      options,
      data,
    );
    return Axios[method](requestURI.url, data, {
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
        cancelToken:
          requestSignal && requestSignal.source
            ? requestSignal.source.token
            : undefined,
      },
    }).then(transformResult);
  };
}

function generateForm<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    form: FormData,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL("post", key, module, pathParams);
    const data: any = {};
    form.forEach((value, key) => {
      data[key] = value;
    });
    const requestSignal = getCancelSource(
      requestURI,
      options,
      data,
    );
    return Axios.post(requestURI.url, form, {
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
        cancelToken:
          requestSignal && requestSignal.source
            ? requestSignal.source.token
            : undefined,
      },
    }).then(transformResult);
  };
}

function generateOptions<M extends string>() {
  return (
    apiKey: string | { module: M; apiKey: string },
    data?: Record<string, any>,
    pathParams?: string[],
    options = new RequestOptionInfo(),
  ) => {
    const { key, module } = dealApiKey(apiKey);
    const requestURI = getRequestURL("options", key, module, pathParams);
    const requestSignal = getCancelSource(
      requestURI,
      options,
      data,
    );
    return Axios.options(requestURI.url, {
      data,
      headers: {
        post: { "Content-Type": undefined },
        ...options.headers,
        cancelToken:
          requestSignal && requestSignal.source
            ? requestSignal.source.token
            : undefined,
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
    delete config.data._requestURI;
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
    post: generatePostPutPatch<M>("post"),
    put: generatePostPutPatch<M>("put"),
    patch: generatePostPutPatch<M>("patch"),
    form: generateForm<M>(),
    options: generateOptions<M>(),
  };
}
