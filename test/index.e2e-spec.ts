/// <reference types="../packages/typings" />
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal";

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
const apiConfig: ApiConfigInfo<"baidu"> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
};

describe("初始化", () => {
  const proxyHttp = ensureInitialized(apiConfig);
  expect(proxyHttp).toBe({})
});
