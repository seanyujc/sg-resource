import type { ApiInfo } from "./ApiInfo";

export type Method =
  | "get"
  | "delete"
  | "head"
  | "post"
  | "put"
  | "patch"
  | "form"
  | "options";

export class ApiConfigInfo<T extends string, K extends string> {
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
