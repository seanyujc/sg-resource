import { loadConfig } from "../../lib/common/config";
import { ApiConfigInfo } from "../../lib/domain/ApiConfigInfo";
import { InterceptorsOptions } from "../../lib/domain/InterceptorsOptions";

export function ensureInitialized<T extends any>(apiConfig: ApiConfigInfo<string>, options?: InterceptorsOptions<T>) {
    console.log(loadConfig(apiConfig));
}