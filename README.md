# nexera-pay

[![npm version](https://img.shields.io/npm/v/nexera-pay?style=flat-square&color=a78bfa&logo=npm)](https://www.npmjs.com/package/nexera-pay)
[![npm downloads](https://img.shields.io/npm/dm/nexera-pay?style=flat-square&color=67e8f9)](https://www.npmjs.com/package/nexera-pay)
[![bundle size](https://img.shields.io/bundlephobia/minzip/nexera-pay?style=flat-square&label=bundle)](https://bundlephobia.com/package/nexera-pay)
[![license](https://img.shields.io/npm/l/nexera-pay?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Nexera-Africa-DRC/nexera-pay-js/publish.yml?style=flat-square&label=publish)](https://github.com/Nexera-Africa-DRC/nexera-pay-js/actions)

SDK JavaScript/TypeScript officiel pour **Nexera Pay** — API paiement Payment Facilitator RDC (Mobile Money + Carte, wrapper Moko/PayDRC/Cybersource).

## Installation

```bash
npm install nexera-pay
```

## Quickstart

```typescript
import { NexeraPay } from "nexera-pay";

const nexera = new NexeraPay({
  apiKey: process.env.NEXERA_PAY_API_KEY!,   // nex_test_... ou nex_live_...
  secret: process.env.NEXERA_PAY_SECRET!,
});

// Créer un paiement Mobile Money (STK)
const payment = await nexera.payments.create({
  amount: 10000,           // 100.00 USD en cents
  currency: "USD",
  method: "mobile_money",
  operator: "mpesa",
  phone: "243812345001",
  reference: "INV-2026-0001",
  description: "Facture #INV-2026-0001",
});

console.log(payment.id, payment.status);   // pay_xxxx  processing
```

## Créer un paiement carte (hosted checkout)

```typescript
const payment = await nexera.payments.create({
  amount: 50000,
  currency: "USD",
  method: "card",
  reference: "INV-002",
  customer_email: "client@example.com",
  customer_name: "Jean Kabala",
  return_url: "https://monsite.cd/facture/002",
});

// Rediriger le client :
window.location.href = payment.checkout_url!;
```

## Vérifier un webhook

```typescript
import express from "express";
import { Webhooks } from "nexera-pay";

app.post("/webhooks/nexera", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.header("X-Nexera-Signature");
  const bodyStr = req.body.toString();

  if (!Webhooks.verifySignature(process.env.NEXERA_WEBHOOK_SECRET!, signature!, bodyStr)) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(bodyStr);
  if (event.type === "payment.succeeded") {
    const tx = event.data.object;
    // Marquer la facture tx.reference comme payée dans ta DB
  }
  res.status(200).send("ok");
});
```

## Payout B2C (marchand → client)

```typescript
const payout = await nexera.payouts.create({
  amount: 100,
  currency: "CDF",
  method: "mobile_money",
  operator: "mpesa",
  phone: "243828584688",
  reference: "REMB-001",
  description: "Remboursement produit défectueux",
});
```

## Refund

```typescript
// Refund total
await nexera.refunds.create("pay_xxx");

// Refund partiel
await nexera.refunds.create("pay_xxx", { amount: 5000, reason: "Article manquant" });
```

## Balance

```typescript
const bal = await nexera.balance.get();
console.log(bal.available.USD, bal.available.CDF);   // en cents
```

## Sandbox (mode test)

En mode test (clé `nex_test_...`), les MSISDN suivants déclenchent des scenarios déterministes :

| MSISDN | Résultat |
|--------|----------|
| `...001` | Succès en 3s |
| `...002` | Failed immédiat |
| `...003` | Timeout puis failed (60s) |
| `...004` | Failed (wrong PIN) |
| `...005` | Succès en 10s |

## Gestion d'erreurs

```typescript
import { NexeraPay, SignatureError, RateLimitError, ValidationError } from "nexera-pay";

try {
  const p = await nexera.payments.create({ ... });
} catch (e) {
  if (e instanceof RateLimitError) {
    console.log(`Rate limited, retry dans ${e.retryAfter}s`);
  } else if (e instanceof ValidationError) {
    console.log("Validation failed:", e.detail);
  } else if (e instanceof SignatureError) {
    // Ta clé/secret est mauvaise ou le timestamp système est décalé
  }
}
```

## Docs complètes

https://docs.nexera.africa/pay

## License

MIT
