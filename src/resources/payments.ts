import type { NexeraPayCore } from "../client.js";
import type { Payment, PaymentCreateParams, ListResponse } from "../types.js";

export class Payments {
  constructor(private core: NexeraPayCore) {}

  create(params: PaymentCreateParams, opts?: { idempotencyKey?: string }): Promise<Payment> {
    const idem = opts?.idempotencyKey ?? cryptoRandomId();
    return this.core.request<Payment>("POST", "/v1/payments", params, { idempotencyKey: idem });
  }

  get(id: string): Promise<Payment> {
    return this.core.request<Payment>("GET", `/v1/payments/${id}`);
  }

  list(params?: { reference?: string; status?: string; limit?: number; cursor?: string }): Promise<ListResponse<Payment>> {
    return this.core.request<ListResponse<Payment>>("GET", "/v1/payments", undefined, { params });
  }
}

function cryptoRandomId(): string {
  return (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now());
}
