export class ApiInfo<T extends string> {
  host: T;
  path: string;
  url?: string;
  hostUrl?: string;

  constructor(host: T, path = "", url = "", hostUrl = "") {
    this.host = host;
    this.path = path;
    this.url = url;
    this.hostUrl = hostUrl;
  }
}
