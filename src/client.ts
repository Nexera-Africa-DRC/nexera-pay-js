/** Core client — signature HMAC, retry, error mapping. */

import { computeSignature } from "./signature.js";
import { makeError, NexeraError } from "./errors.js";

export interface NexeraPayOptions {
  apiKey: string;
  secret: string;
  baseUrl?: string;
  timeout?: number;   // ms, default 30000
  maxRetries?: number;   // GET only, default 2
}

export class NexeraPayCore {
  apiKey: string;
  secret: string;
  baseUrl: string;
  timeout: number;
  maxRetries: number;

  constructor(opts: NexeraPayOptions) {
    if (!opts.apiKey) throw new Error("NexeraPay: apiKey requis");
    if (!opts.secret) throw new Error("NexeraPay: secret requis");
    this.apiKey = opts.apiKey;
    this.secret = opts.secret;
    this.baseUrl = (opts.baseUrl || "https://pay.nexera.africa").replace(/\/$/, "");
    this.timeout = opts.timeout ?? 30_000;
    this.maxRetries = opts.maxRetries ?? 2;
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: any,
    opts?: { idempotencyKey?: string; params?: Record<string, string | number | undefined> },
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (opts?.params) {
      const q = new URLSearchParams();
      Object.entries(opts.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
      });
      const qs = q.toString();
      if (qs) url += `?${qs}`;
    }

    const bodyStr = body !== undefined ? JSON.stringify(body) : "";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "nexera-pay-js/0.1.0",
    };
    if (method.toUpperCase() !== "GET") {
      headers["X-Timestamp"] = timestamp;
      headers["X-Signature"] = computeSignature(this.secret, timestamp, method, path, bodyStr);
    }
    if (opts?.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

    const maxAttempts = method.toUpperCase() === "GET" ? this.maxRetries + 1 : 1;
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        const res = await fetch(url, {
          method: method.toUpperCase(),
          headers,
          body: bodyStr || undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        let data: any = null;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("json")) data = await res.json();
        else data = { raw: await res.text() };

        if (res.ok) return data as T;
        throw makeError(res.status, data);
      } catch (e) {
        lastErr = e;
        if (e instanceof NexeraError) throw e;   // erreurs API : pas de retry
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  }
}
