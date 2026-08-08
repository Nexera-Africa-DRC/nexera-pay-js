/** Exceptions typées Nexera Pay. Toutes héritent de NexeraError. */

export class NexeraError extends Error {
  status: number;
  type: string;
  detail?: string;
  requestId?: string;
  raw: unknown;

  constructor(status: number, body: any) {
    const title = body?.title || body?.message || `HTTP ${status}`;
    super(title);
    this.name = "NexeraError";
    this.status = status;
    this.type = body?.type || "";
    this.detail = body?.detail;
    this.requestId = body?.request_id;
    this.raw = body;
  }
}

export class AuthError extends NexeraError { constructor(body: any) { super(401, body); this.name = "AuthError"; } }
export class SignatureError extends NexeraError { constructor(body: any) { super(401, body); this.name = "SignatureError"; } }
export class IdempotencyConflictError extends NexeraError { constructor(body: any) { super(409, body); this.name = "IdempotencyConflictError"; } }
export class RateLimitError extends NexeraError {
  retryAfter?: number;
  constructor(body: any) { super(429, body); this.name = "RateLimitError"; this.retryAfter = body?.retry_after; }
}
export class ValidationError extends NexeraError { constructor(body: any) { super(422, body); this.name = "ValidationError"; } }
export class ProviderError extends NexeraError {
  provider?: string;
  constructor(body: any) { super(503, body); this.name = "ProviderError"; this.provider = body?.provider; }
}

export function makeError(status: number, body: any): NexeraError {
  const type = body?.type || "";
  if (type.includes("signature-invalid")) return new SignatureError(body);
  if (type.includes("auth") || type.includes("api-key")) return new AuthError(body);
  if (type.includes("idempotency")) return new IdempotencyConflictError(body);
  if (type.includes("rate-limit")) return new RateLimitError(body);
  if (type.includes("validation")) return new ValidationError(body);
  if (type.includes("provider")) return new ProviderError(body);
  return new NexeraError(status, body);
}
