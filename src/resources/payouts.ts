import type { NexeraPayCore } from "../client.js";
import type { Payout, PayoutCreateParams, ListResponse } from "../types.js";

export class Payouts {
  constructor(private core: NexeraPayCore) {}

  create(params: PayoutCreateParams, opts?: { idempotencyKey?: string }): Promise<Payout> {
    const idem = opts?.idempotencyKey ?? (globalThis.crypto?.randomUUID?.() ?? String(Date.now()));
    return this.core.request<Payout>("POST", "/v1/payouts", params, { idempotencyKey: idem });
  }

  get(id: string): Promise<Payout> {
    return this.core.request<Payout>("GET", `/v1/payouts/${id}`);
  }

  list(params?: { limit?: number; cursor?: string }): Promise<ListResponse<Payout>> {
    return this.core.request<ListResponse<Payout>>("GET", "/v1/payouts", undefined, { params });
  }
}
