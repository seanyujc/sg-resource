import { getRequestURL, loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export function ensureInitialized<T extends any>(
  apiConfig: ApiConfigInfo<string, string>,
  options?: InterceptorsOptions<T>,
) {
  const config = loadConfig(apiConfig);
  return config;
}

function transformResult(response: AxiosResponse<any>) {
  return Promise.resolve(response.data);
}

export function get<M extends string>(
  apiKey: string | { module: M; apiKey: string },
  params?: Record<string, string>,
  pathParams?: string[],
  options: { headers?: any } = {},
) {
  let key = "";
  let module = "default";
  if (typeof apiKey === "object") {
    key = apiKey.apiKey;
    module = apiKey.module;
  } else {
    key = apiKey;
  }
  const url = getRequestURL("get", key, module, pathParams);
  return Axios.get(url, { params, headers: options.headers }).then(
    transformResult,
  );
}
