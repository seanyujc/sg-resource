import { ConfigAdapter } from "./config-adapter";

export class WXProxyHttp {
    constructor(protected configAdapter: ConfigAdapter,) { }
    post(apiKey: string,
        data?: any,
        pathParams?: string[],
        options: { headers?: any } = {},) {
        return new Promise((resolve, reject) => {
            const url = this.configAdapter.getRequestUrl("POST", apiKey, pathParams);
            wx.request({
                data,
                method: "POST",
                url,
                success: (res) => {
                    transformResult(res).then(resolve)
                }
            })
        })
    }
}

function transformResult(response: WechatMiniprogram.RequestSuccessCallbackResult<string | WechatMiniprogram.IAnyObject | ArrayBuffer>) {
    return Promise.resolve(response.data);
}