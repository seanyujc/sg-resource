import { IApiConfig, ISiteConfig, SGResource } from "@/index";
const siteConfig: ISiteConfig = [
  {
    env: "DEV",
    remote: {
      hosts: { baidu: "https://www.hao123.com" },
    },
    local: { publicPath: "/" },
  },
];

const apiConfig: IApiConfig<"baidu"> = {
  get: {
    citymenu: { path: "/api/citymenu?", host: "baidu" },
  },
  post: {},
};

describe("初始化", () => {
  SGResource.ensureInitialized(siteConfig, apiConfig);
});
