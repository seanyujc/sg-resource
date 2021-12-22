export class ApiInfo<T extends string> {
  host: T;
  path: string;

  constructor(host: T, path = "") {
    this.host = host;
    this.path = path;
  }
}
