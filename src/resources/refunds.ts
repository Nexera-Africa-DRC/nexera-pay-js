import type { NexeraPayCore } from "../client.js";
import type { Refund, RefundCreateParams, ListResponse } from "../types.js";

export class Refunds {
  constructor(private core: NexeraPayCore) {}

  create(paymentId: string, params: RefundCreateParams = {}): Promise<Refund> {
    return this.core.request<Refund>("POST", `/v1/payments/${paymentId}/refund`, params);
  }

  list(paymentId: string): Promise<ListResponse<Refund>> {
    return this.core.request<ListResponse<Refund>>("GET", `/v1/payments/${paymentId}/refunds`);
  }
}
