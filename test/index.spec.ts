/// <reference types="../packages/typings" />
import { getRequestURL, loadConfig } from "../lib/common/config";
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal/index";
import { get } from "../packages/normal/main";

declare type Env = "DEV" | "SIT" | "UAT" | "PROD" | "UAT1";
declare type Host = "baidu";
declare type Module = "shanghai";

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
    citymenu: { path: "/api/citymenu", host: "baidu" },
  },
  post: {},
  modules: { shanghai: apiShanghaiConfig },
};

global.getSiteConfig = () => SITE_CONFIG;

describe("初始化", () => {
  const config = ensureInitialized(apiConfig);
  it("测试获取url", ()=>{
    const url = getRequestURL("get", "citymenu", "default")
    expect(url).toBe("http://baidu.com/web-api/api/citymenu");
  })
  it("测试请求", () => {
    get("citymenu").then((res) => {
      expect(res).toMatchObject({});
    });
  });
});
