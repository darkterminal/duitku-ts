/**
 * Duitku TypeScript SDK
 *
 * SDK TypeScript untuk integrasi payment gateway Duitku,
 * kompatibel dengan **Node.js** (≥18) dan **Bun**.
 *
 * @packageDocumentation
 */

// ============================================================
// Version
// ============================================================

/**
 * Versi SDK Duitku.
 */
export const VERSION = '0.1.0';

// ============================================================
// Core Classes
// ============================================================

/**
 * Konfigurasi SDK Duitku.
 *
 * @example
 * ```ts
 * import { Config } from 'duitku';
 *
 * const config = new Config('YOUR_MERCHANT_KEY', 'YOUR_MERCHANT_CODE');
 * config.setSandboxMode(true);
 * config.setDuitkuLogs(false);
 * ```
 */
export { Config } from './Config';

/**
 * Sanitizer untuk membersihkan parameter request.
 *
 * Secara otomatis dipanggil oleh `Api` dan `Pop` ketika
 * `config.getSanitizedMode()` bernilai `true`.
 *
 * @example
 * ```ts
 * import { Sanitizer } from 'duitku';
 *
 * const cleanParams = Sanitizer.request(params);
 * ```
 */
export { Sanitizer } from './Sanitizer';

/**
 * Request layer untuk Duitku-API.
 *
 * Menggunakan endpoint `https://sandbox.duitku.com` (sandbox)
 * atau `https://passport.duitku.com` (production).
 *
 * @example
 * ```ts
 * import { Api } from 'duitku';
 *
 * // Create Invoice (paymentMethod wajib)
 * const response = await Api.createInvoice({
 *   paymentAmount: 10000,
 *   paymentMethod: 'BT',
 *   merchantOrderId: 'order-001',
 *   productDetails: 'Test Payment',
 * }, config);
 *
 * // Cek status transaksi
 * const status = await Api.transactionStatus('order-001', config);
 * ```
 */
export { Api } from './Api';

/**
 * Request layer untuk Duitku-Pop.
 *
 * Menggunakan endpoint `https://api-sandbox.duitku.com` (sandbox)
 * atau `https://api-prod.duitku.com` (production).
 *
 * Signature dikirim via HTTP Headers (SHA256).
 *
 * @example
 * ```ts
 * import { Pop } from 'duitku';
 *
 * // Create Invoice (paymentMethod opsional)
 * const response = await Pop.createInvoice({
 *   paymentAmount: 10000,
 *   merchantOrderId: 'order-001',
 *   productDetails: 'Test Payment',
 * }, config);
 *
 * // Callback handler
 * app.post('/callback', (req, res) => {
 *   const notification = Pop.callback(req.body, config);
 *   res.json(notification);
 * });
 * ```
 */
export { Pop } from './Pop';

/**
 * Request base class.
 *
 * Kelas dasar untuk `Api` dan `Pop`. Umumnya tidak perlu digunakan langsung,
 * namun tersedia untuk keperluan extension atau testing.
 *
 * @internal
 */
export { Request } from './Request';

// ============================================================
// Errors
// ============================================================

/**
 * Custom error class untuk semua error yang dihasilkan SDK Duitku.
 *
 * @example
 * ```ts
 * import { DuitkuError } from 'duitku';
 *
 * try {
 *   await Api.createInvoice(params, config);
 * } catch (error) {
 *   if (error instanceof DuitkuError) {
 *     console.error('HTTP Status:', error.statusCode);
 *     console.error('Response:', error.responseBody);
 *   }
 * }
 * ```
 */
export { DuitkuError } from './errors';

// ============================================================
// Types
// ============================================================

/**
 * Type definitions untuk parameter, request, dan response.
 */
export type {
  // Config
  DuitkuConfigOptions,

  // Customer & Address
  Address,
  CustomerDetail,
  ItemDetail,

  // Create Invoice
  CreateInvoiceParams,
  CreateInvoiceResponse,

  // Transaction Status
  TransactionStatusResponse,

  // Callback
  CallbackNotification,

  // Payment Method
  PaymentFee,
  GetPaymentMethodResponse,
} from './types';
