# Duitku SDK Examples

Contoh penggunaan Duitku TypeScript SDK di **Node.js** dan **Bun**.

## Prerequisites

1. Build SDK terlebih dahulu:
   ```bash
   npm run build
   ```
2. Pastikan Node.js >= 18 atau Bun terinstall.

## Konfigurasi

Semua contoh menggunakan sandbox credentials dari Duitku:

API Key: `732B39FC61796845775D2C4FB05332AF`
Merchant Code: `D0001`

Untuk production, ganti dengan credentials Anda dan set `sandboxMode` ke `false`.

## Menjalankan Examples

### Node.js

```bash
node examples/node/createInvoice-pop.mjs
node examples/node/createInvoice-api.mjs
node examples/node/transactionStatus.mjs
node examples/node/getPaymentMethod.mjs
node examples/node/callback-server.mjs
```

### Bun

```bash
bun examples/bun/createInvoice-pop.ts
bun examples/bun/createInvoice-api.ts
bun examples/bun/transactionStatus.ts
bun examples/bun/getPaymentMethod.ts
bun examples/bun/callback-server.ts
```
