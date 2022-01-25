/// <reference types="../packages/typings" />
import { getRequestURL, loadConfig } from "../lib/common/config";
import { ApiConfigInfo } from "../lib/domain/ApiConfigInfo";
import { ensureInitialized } from "../packages/normal/index";

declare type EnvKeys = "DEV" | "SIT" | "UAT" | "PROD" | "UAT1";
declare type HostKeys = "local" | "pmcp";
declare type ModuleKeys = "shanghai";

const SITE_CONFIG: ISiteConfig<EnvKeys, HostKeys> = {
  systems: [
    {
      env: "DEV",
      remote: {
        hosts: {
          local: "http://localhost:8080",
          pmcp: "http://pmcp.dev1.yaoyanshe.net/gateway/pmcp-app",
        },
      },
      local: {},
    },
  ],
  runtimes: "UAT1",
};

const apiShanghaiConfig: ApiConfigInfo<HostKeys, ModuleKeys> = {
  post: {
    modifyCountry: {
      path: "/modify_country",
      host: "local",
    },
  },
  options: {
    modifyCountry: {
      path: "/modify_country",
      host: "local",
    },
  },
};

const apiConfig: ApiConfigInfo<HostKeys, ModuleKeys> = {
  get: {
    getCountry: { path: "/get_country", host: "local" },
  },
  head: {
    getCountry: { path: "/get_country", host: "local" },
  },
  post: {
    fetchSubjectInfo: { path: "/smoSubject/visit/list", host: "pmcp" },
  },

  modules: { shanghai: apiShanghaiConfig },
};

global.getSiteConfig = () => SITE_CONFIG;

describe("初始化", () => {
  const { config, get, _delete, head, post, options } = ensureInitialized<
    ModuleKeys,
    any
  >(apiConfig);
  it("测试获取url", () => {
    const requestURL = getRequestURL("get", "getCountry");
    expect(requestURL.url).toBe("http://localhost:8080/get_country");
  });
  it("测试get请求", async () => {
    const pa = Promise.all([
      get("getCountry", { id: 1, name: "US" }, [], {
        cancelLevel: 6,
      }),
      get("getCountry", { id: 1, name: "US" }, [], {
        cancelLevel: 6,
      }),
    ]);
    const res = await pa;
    expect(res).toMatchObject({ id: 1, content: "US" });
  });
  // it("测试head请求", async () => {
  //   const res = await head("getCountry", { id: 1, name: "US" });
  //   console.log(res);
  // });
  // it("测试post请求", async () => {
  //   const res = await post(
  //     { apiKey: "modifyCountry", module: "shanghai" },
  //     { id: 2, content: "US" },
  //   );
  //   expect(res).toMatchObject({ id: 2, content: "US" });
  // });
  // it("测试options请求", async () => {
  //   const res = await options(
  //     { apiKey: "modifyCountry", module: "shanghai" },
  //     { id: 2, content: "US" },
  //   );
  //   console.log(res);

  // });
});
