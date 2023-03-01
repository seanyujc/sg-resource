import type { CancelTokenSource } from "axios";

export class RequestSignalInfo {
  _overKeys: string[] = [];
  get overKeys() {
    for (let index = this.list.length; index > 0; index--) {
      const _signalList = this.list.concat();
      _signalList.length = index;
      const str = _signalList.join("|");
      this._overKeys.push(str);
    }
    return this._overKeys;
  }

  constructor(
    public list: string[] = [],
    public signal = "",
    public key = "",
    public source: CancelTokenSource | null = null,
  ) {}
}
