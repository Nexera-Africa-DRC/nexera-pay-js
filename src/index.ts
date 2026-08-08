/** Nexera Pay — SDK JavaScript/TypeScript officiel.
 *
 * Usage :
 *   import { NexeraPay } from "nexera-pay";
 *   const nexera = new NexeraPay({ apiKey: "nex_test_...", secret: "sk_..." });
 *   const p = await nexera.payments.create({
 *     amount: 100, currency: "CDF", method: "mobile_money",
 *     operator: "mpesa", phone: "243828584688", reference: "INV-001"
 *   });
 */

import { NexeraPayCore, type NexeraPayOptions } from "./client.js";
import { Payments } from "./resources/payments.js";
import { Payouts } from "./resources/payouts.js";
import { Refunds } from "./resources/refunds.js";
import { BalanceResource, Settlements } from "./resources/balance.js";
import { verifyWebhookSignature } from "./signature.js";

export class NexeraPay {
  payments: Payments;
  payouts: Payouts;
  refunds: Refunds;
  balance: BalanceResource;
  settlements: Settlements;
  webhooks: typeof Webhooks;

  constructor(opts: NexeraPayOptions) {
    const core = new NexeraPayCore(opts);
    this.payments = new Payments(core);
    this.payouts = new Payouts(core);
    this.refunds = new Refunds(core);
    this.balance = new BalanceResource(core);
    this.settlements = new Settlements(core);
    this.webhooks = Webhooks;
  }
}

/** Helpers webhooks (statiques — pas besoin d'instance). */
export const Webhooks = {
  verifySignature: verifyWebhookSignature,
};

export * from "./types.js";
export * from "./errors.js";
export { verifyWebhookSignature, computeSignature } from "./signature.js";
export type { NexeraPayOptions } from "./client.js";
