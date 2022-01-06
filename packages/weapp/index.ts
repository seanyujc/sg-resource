import { loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";

function initInterceptors(params: any) {
  
}

export function ensureInitialized<T extends any>(
  apiConfig: ApiConfigInfo<string, string>,
  options?: InterceptorsOptions<T>,
) {
  const config = loadConfig(apiConfig);
  initInterceptors(options);
  console.log(loadConfig(apiConfig));
}
