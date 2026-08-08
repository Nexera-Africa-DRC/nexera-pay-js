/** Types de réponse API Nexera Pay. */

export type Currency = "USD" | "CDF";
export type PaymentMethod = "mobile_money" | "card";
export type Operator = "mpesa" | "airtel" | "orange" | "africell";
export type Environment = "test" | "live";
export type FeeBearer = "merchant" | "customer";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded";
export type RefundStatus = "pending" | "succeeded" | "failed";
export type SettlementStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Payment {
  id: string;
  object: "payment";
  status: PaymentStatus;
  method: PaymentMethod;
  environment: Environment;
  currency: Currency;
  amount_charged: number;
  amount_net: number;
  fee: number;
  fee_bearer: FeeBearer;
  reference: string | null;
  description: string | null;
  provider: string;
  provider_ref: string | null;
  checkout_url?: string | null;
  created: number;
  completed: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface Payout {
  id: string;
  object: "payout";
  status: PaymentStatus;
  method: PaymentMethod;
  environment: Environment;
  currency: Currency;
  amount: number;
  reference: string | null;
  description: string | null;
  provider: string;
  provider_ref: string | null;
  customer_msisdn: string | null;
  customer_operator: string | null;
  created: number;
  completed: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface Refund {
  id: string;
  object: "refund";
  transaction_id: string;
  amount: number;
  currency: Currency;
  reason: string | null;
  status: RefundStatus;
  provider_ref: string | null;
  created: number;
  completed: number | null;
}

export interface Balance {
  object: "balance";
  environment: Environment;
  available: Record<Currency, number>;
  pending: Record<Currency, number>;
  settled: Record<Currency, number>;
}

export interface Settlement {
  id: string;
  object: "settlement";
  currency: Currency;
  amount: number;
  gross: number;
  fees: number;
  refunds: number;
  transaction_count: number;
  period_start: string;
  period_end: string;
  environment: Environment;
  status: SettlementStatus;
  external_ref: string | null;
  created: number;
  completed: number | null;
}

export interface ListResponse<T> {
  object: "list";
  data: T[];
  has_more?: boolean;
  next_cursor?: string | null;
}

// ─── Params création ───

export interface PaymentCreateParams {
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  operator?: Operator;
  phone?: string;
  reference?: string;
  description?: string;
  callback_url?: string;
  return_url?: string;
  metadata?: Record<string, unknown>;
  fee_bearer?: FeeBearer;
  customer_email?: string;
  customer_name?: string;
}

export interface PayoutCreateParams {
  amount: number;
  currency: Currency;
  method: "mobile_money";
  operator: Operator;
  phone: string;
  reference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface RefundCreateParams {
  amount?: number;
  reason?: string;
}
