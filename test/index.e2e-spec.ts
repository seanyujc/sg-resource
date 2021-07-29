import { IApiConfig, ISite, ISiteConfig, SGResource } from "../src/index";

const SITE_CONFIG: ISiteConfig = {
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
  runtime: "DEV",
};
const apiConfig: IApiConfig<"baidu"> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
};

describe("初始化", () => {
  SGResource.ensureInitialized(SITE_CONFIG, apiConfig);
});
