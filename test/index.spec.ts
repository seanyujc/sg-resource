/// <reference types="../packages/typings" />
import { loadSiteConfig } from "../lib/common/config";
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal/index";

declare type Env = "DEV" | "SIT" | "UAT" | "PROD" | "UAT1";
declare type Host = "baidu";
 
const SITE_CONFIG: ISiteConfig<Env, Host> = {
  systems: [
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

const apiConfig: ApiConfigInfo<Host> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
};

global.getSiteConfig = () => SITE_CONFIG;

describe("初始化", () => {
  const config = loadSiteConfig();
  const proxyHttp = ensureInitialized(apiConfig);
  it("", () => {
    expect(proxyHttp.systemConfig).toMatchObject(SITE_CONFIG.systems[0]);
  });
});
