/**
 * Duitku TypeScript SDK
 *
 * SDK untuk integrasi payment gateway Duitku,
 * kompatibel dengan Node.js dan Bun.
 */

export const VERSION = '0.1.0';

// Config
export { Config } from './Config';

// Sanitizer
export { Sanitizer } from './Sanitizer';

// Error
export { DuitkuError } from './errors';

// Types
export type {
  DuitkuConfigOptions,
  Address,
  CustomerDetail,
  ItemDetail,
  CreateInvoiceParams,
  CreateInvoiceResponse,
  TransactionStatusResponse,
  CallbackNotification,
  PaymentFee,
  GetPaymentMethodResponse,
} from './types';
