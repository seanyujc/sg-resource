import { ApiInfo } from "./ApiInfo";

export class ApiConfigInfo<T extends string> {
  post?: Record<string, ApiInfo<T>>;
  get?: Record<string, ApiInfo<T>>;
  put?: Record<string, ApiInfo<T>>;
  delete?: Record<string, ApiInfo<T>>;
  form?: Record<string, ApiInfo<T>>;
  modules?: Record<string, ApiConfigInfo<T>>;
}
