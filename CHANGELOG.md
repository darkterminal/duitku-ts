# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-15

### Added

- Initial release of Duitku TypeScript SDK
- Full compatibility with **Node.js >= 18** and **Bun**
- **Config** class for managing API key, merchant code, sandbox mode, sanitized mode, and logging
- **Sanitizer** class for request parameter sanitization (immutable approach)
- **Request** base class with native `fetch` and file logging
- **Api** class for Duitku-API integration:
  - `createInvoice()` — Create invoice with MD5 signature in body
  - `transactionStatus()` — Check transaction status
  - `getPaymentMethod()` — Get available payment methods
  - `callback()` — Validate callback notification
- **Pop** class for Duitku-Pop integration:
  - `createInvoice()` — Create invoice with SHA256 signature in headers
  - `transactionStatus()` — Check transaction status
  - `getPaymentMethod()` — Get available payment methods
  - `callback()` — Validate callback notification
- **DuitkuError** custom error class with `statusCode` and `responseBody`
- Full TypeScript type definitions for all params and responses
- Dual package output: CommonJS (`.cjs`) and ESM (`.js`)
- Comprehensive test suite with Vitest (unit tests + integration tests)
- CI pipeline with GitHub Actions (Node 18, 20, 22 + Bun)
- Examples for Node.js and Bun

### Changed from PHP SDK

- All HTTP methods are now **async** (return `Promise`)
- `callback()` now accepts `body` as parameter instead of reading `$_POST`
- Methods return **typed objects** instead of JSON strings
- Sanitizer uses **immutable approach** (returns new object)
- SSL verification is **enabled** by default (PHP SDK disabled it)
- Log directory uses `process.cwd()` instead of `__DIR__`
- `Content-Length` header is no longer set manually (handled by `fetch`)

[1.0.0]: https://github.com/darkterminal/duitku-ts/releases/tag/v1.0.0
