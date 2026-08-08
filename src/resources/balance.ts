import type { NexeraPayCore } from "../client.js";
import type { Balance, Settlement, ListResponse } from "../types.js";

export class BalanceResource {
  constructor(private core: NexeraPayCore) {}
  get(): Promise<Balance> {
    return this.core.request<Balance>("GET", "/v1/balance");
  }
}

export class Settlements {
  constructor(private core: NexeraPayCore) {}
  list(params?: { limit?: number }): Promise<ListResponse<Settlement>> {
    return this.core.request<ListResponse<Settlement>>("GET", "/v1/settlements", undefined, { params });
  }
}
