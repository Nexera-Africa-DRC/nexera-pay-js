/**
 * Signature HMAC-SHA256 pour authentifier les requêtes API Nexera Pay.
 * Format : sha256=<hex>. Payload signé = "{timestamp}.{METHOD}.{path}.{body}"
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export function computeSignature(
  secret: string,
  timestamp: string,
  method: string,
  path: string,
  body: string,
): string {
  const payload = `${timestamp}.${method.toUpperCase()}.${path}.${body || ""}`;
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${mac}`;
}

/**
 * Vérifie une signature webhook Nexera Pay (format Stripe : t=ts,v1=hex).
 * Retourne true si la signature est valide ET si timestamp fresh (± tolerance).
 */
export function verifyWebhookSignature(
  secret: string,
  signatureHeader: string,
  body: string,
  toleranceSeconds: number = 300,
): boolean {
  if (!secret || !signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const idx = p.indexOf("=");
      return idx >= 0 ? [p.slice(0, idx), p.slice(idx + 1)] : [p, ""];
    }),
  );
  const ts = parseInt(parts.t, 10);
  const v1 = parts.v1;
  if (!ts || !v1) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}
