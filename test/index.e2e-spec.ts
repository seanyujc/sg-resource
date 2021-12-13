import { IApiConfig, ISite, ISiteConfig, SGResource } from "../src/index";

const SITE_CONFIG: ISiteConfig<"DEV" | "SIT" | "UAT" | "PROD" | "UAT1"> = {
  system: [
    {
      env: "DEV",
      remote: {
        hosts: {
          baidu: "http://baidu.com/web-api",
        },
      },
      local: {},
    },
  ],
  runtimes: "UAT1",
};
const apiConfig: IApiConfig<"baidu"> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
};

describe("初始化", () => {
  const proxyHttp = SGResource.ensureInitialized(SITE_CONFIG, apiConfig);
  proxyHttp.get()
});
