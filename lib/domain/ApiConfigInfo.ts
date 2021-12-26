import { ApiInfo } from "./ApiInfo";

export type Method =
  | "get"
  | "delete"
  | "head"
  | "options"
  | "post"
  | "put"
  | "patch"
  | "form";

export type IApiConfigInfo<T extends string> = {
  [key in Method]?: Record<string, ApiInfo<T>>;
};

export class ApiConfigInfo<T extends string, K extends string>
  implements IApiConfigInfo<T>
{
  get?: Record<string, ApiInfo<T>>;
  delete?: Record<string, ApiInfo<T>>;
  head?: Record<string, ApiInfo<T>>;
  options?: Record<string, ApiInfo<T>>;
  post?: Record<string, ApiInfo<T>>;
  put?: Record<string, ApiInfo<T>>;
  patch?: Record<string, ApiInfo<T>>;
  form?: Record<string, ApiInfo<T>>;
  modules?: Record<K, ApiConfigInfo<T, K>>;
}
