/// <reference types="../../packages/typings" />
import { ApiConfigInfo } from "../domain/ApiConfigInfo";


export function loadConfig(apiConfig: ApiConfigInfo<string>) {
    if (typeof getSiteConfig !== "undefined") {
       return getSiteConfig();
    }else{
        return {}
    }
}
