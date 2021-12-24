/// <reference types="../packages/typings" />
import { loadConfig } from "../lib/common/config";
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal/index";

declare type Env = "DEV" | "SIT" | "UAT" | "PROD" | "UAT1";
declare type Host = "baidu";
declare type Module = "shanghai"

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

const apiShanghaiConfig: ApiConfigInfo<Host, Module> = {};

const apiConfig: ApiConfigInfo<Host, Module> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
  modules: { shanghai: apiShanghaiConfig },
};

global.getSiteConfig = () => SITE_CONFIG;

describe("初始化", () => {
  const config = loadConfig(apiConfig);
  const proxyHttp = ensureInitialized(apiConfig);
  it("", () => {
    expect(proxyHttp.systemConfig).toMatchObject(SITE_CONFIG.systems[0]);
  });
});
