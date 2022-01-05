/// <reference types="../packages/typings" />
import { getRequestURL, loadConfig } from "../lib/common/config";
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal/index";

declare type Env = "DEV" | "SIT" | "UAT" | "PROD" | "UAT1";
declare type Host = "local";
declare type Module = "shanghai";

const SITE_CONFIG: ISiteConfig<Env, Host> = {
  systems: [
    {
      env: "DEV",
      remote: {
        hosts: {
          local: "http://localhost:8080",
        },
      },
      local: {},
    },
  ],
  runtimes: "UAT1",
};

const apiShanghaiConfig: ApiConfigInfo<Host, Module> = {
  post: {
    modifyCountry: {
      path: "/modify_country",
      host: "local",
    },
  },
};

const apiConfig: ApiConfigInfo<Host, Module> = {
  get: {
    getCountry: { path: "/get_country", host: "local" },
  },
  post: {},
  modules: { shanghai: apiShanghaiConfig },
};

global.getSiteConfig = () => SITE_CONFIG;

describe("初始化", () => {
  const { config, get, post } = ensureInitialized<"shanghai", any>(apiConfig);
  it("测试获取url", () => {
    const url = getRequestURL("get", "getCountry");
    expect(url).toBe("http://localhost:8080/get_country");
  });
  it("测试get请求", () => {
    get("getCountry", { name: "US" }).then((res) => {
      expect(res).toMatchObject({ id: 1, content: "US" });
    });
  });
  it("测试post请求", () => {
    post(
      { apiKey: "modifyCountry", module: "shanghai" },
      { id: 2, content: "US" },
    ).then((res) => {
      expect(res).toMatchObject({ id: 2, content: "US" });
    });
  });
});
