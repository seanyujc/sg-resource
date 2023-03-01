export class RequestOptionInfo {
  headers?: any;
  cancelLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0;
  overCancelUpLevel? = false;
  timeout?: number;
  dataType?: "json" | "其他" = "json";
  responseType?: "text" | "arraybuffer" = "text";
  enableHttp2? = false;
  enableQuic? = false;
  enableCache? = false;
  enableHttpDNS? = false;
  httpDNSServiceId?: boolean;
  enableChunked? = false;
}
