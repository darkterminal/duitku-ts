/**
 * Send request and processing response for Duitku-API.
 *
 * Port dari `Duitku/Api.php` ke TypeScript.
 * Menggunakan native `fetch` dan return typed objects.
 *
 * @module Api
 */

import { Request } from './Request';
import { Sanitizer } from './Sanitizer';
import { Config } from './Config';
import { DuitkuError } from './errors';
import { md5, sha256, formatDateTime } from './utils';
import type {
  CreateInvoiceParams,
  CreateInvoiceResponse,
  TransactionStatusResponse,
  GetPaymentMethodResponse,
  CallbackNotification,
} from './types';

export class Api extends Request {
  /**
   * Create Invoice Duitku API.
   *
   * Membuat invoice untuk transaksi pembayaran.
   *
   * **Catatan:** `paymentMethod` wajib diisi untuk Duitku-API.
   * Contoh: `"BT"` untuk Permata Bank Virtual Account.
   *
   * Signature: `md5(merchantCode + merchantOrderId + paymentAmount + apiKey)`
   *
   * @param payload - Parameter invoice
   * @param config - Konfigurasi Duitku
   * @returns Response dari Duitku API
   * @throws {DuitkuError} Jika request gagal
   *
   * @example
   * ```ts
   * import { Config, Api } from 'duitku';
   *
   * const config = new Config('YOUR_MERCHANT_KEY', 'YOUR_MERCHANT_CODE', true);
   *
   * const params = {
   *   paymentAmount: 10000,
   *   paymentMethod: 'BT', // Wajib untuk Duitku-API
   *   merchantOrderId: 'order-001',
   *   productDetails: 'Test Payment',
   *   email: 'customer@gmail.com',
   *   phoneNumber: '081234567890',
   *   customerVaName: 'John Doe',
   *   callbackUrl: 'http://YOUR_SERVER/callback',
   *   returnUrl: 'http://YOUR_SERVER/return',
   *   expiryPeriod: 60,
   * };
   *
   * const response = await Api.createInvoice(params, config);
   * console.log(response.paymentUrl);
   * ```
   */
  static async createInvoice(
    payload: CreateInvoiceParams,
    config: Config
  ): Promise<CreateInvoiceResponse> {
    let sanitizedPayload = payload;
    if (config.getSanitizedMode()) {
      sanitizedPayload = Sanitizer.request(payload);
    }

    // Catatan: Di PHP, ada variabel $timestamp yang di-set tapi tidak digunakan.
    // Kita skip karena memang tidak diperlukan untuk signature Api.createInvoice.

    const enrichedPayload: Record<string, unknown> = {
      ...sanitizedPayload,
      merchantCode: config.getMerchantCode(),
      signature: md5(
        config.getMerchantCode() +
          payload.merchantOrderId +
          payload.paymentAmount +
          config.getApiKey()
      ),
    };

    const params = JSON.stringify(enrichedPayload);
    const setLogFunction = 'Api->createInvoice';
    const url = config.getApiUrl() + '/webapi/api/merchant/v2/inquiry';

    const response = await Api.sendRequest(url, params, config, setLogFunction);
    return JSON.parse(response) as CreateInvoiceResponse;
  }

  /**
   * Cek Transaction Status Duitku API.
   *
   * Mengecek status transaksi berdasarkan merchantOrderId.
   *
   * Signature: `md5(merchantCode + merchantOrderId + apiKey)`
   *
   * @param merchantOrderId - Order ID dari merchant
   * @param config - Konfigurasi Duitku
   * @returns Status transaksi
   * @throws {DuitkuError} Jika request gagal
   *
   * @example
   * ```ts
   * const status = await Api.transactionStatus('order-001', config);
   *
   * if (status.statusCode === '00') {
   *   // Action Success
   * } else if (status.statusCode === '01') {
   *   // Action Pending
   * } else {
   *   // Action Failed Or Expired
   * }
   * ```
   */
  static async transactionStatus(
    merchantOrderId: string,
    config: Config
  ): Promise<TransactionStatusResponse> {
    const signature = md5(config.getMerchantCode() + merchantOrderId + config.getApiKey());

    const payload = {
      merchantCode: config.getMerchantCode(),
      merchantOrderId,
      signature,
    };

    const params = JSON.stringify(payload);
    const setLogFunction = 'Api->transactionStatus';
    const url = config.getApiUrl() + '/webapi/api/merchant/transactionStatus';

    const response = await Api.sendRequest(url, params, config, setLogFunction);
    return JSON.parse(response) as TransactionStatusResponse;
  }

  /**
   * Get List Payment Method Duitku API.
   *
   * Mengambil daftar metode pembayaran yang tersedia beserta biayanya.
   *
   * Signature: `sha256(merchantCode + paymentAmount + datetime + apiKey)`
   *
   * @param paymentAmount - Amount transaksi
   * @param config - Konfigurasi Duitku
   * @returns Daftar metode pembayaran
   * @throws {DuitkuError} Jika request gagal
   *
   * @example
   * ```ts
   * const methods = await Api.getPaymentMethod(10000, config);
   * console.log(methods.paymentFee);
   * // [{ name: 'Permata Bank Virtual Account', code: 'BT', fee: 4000 }, ...]
   * ```
   */
  static async getPaymentMethod(
    paymentAmount: number | string,
    config: Config
  ): Promise<GetPaymentMethodResponse> {
    const datetime = formatDateTime();
    const signature = sha256(
      config.getMerchantCode() + paymentAmount + datetime + config.getApiKey()
    );

    const payload = {
      merchantCode: config.getMerchantCode(),
      amount: paymentAmount,
      datetime,
      signature,
    };

    const params = JSON.stringify(payload);
    const setLogFunction = 'Api->getPaymentMethod';
    const url = config.getApiUrl() + '/webapi/api/merchant/paymentmethod/getpaymentmethod';

    const response = await Api.sendRequest(url, params, config, setLogFunction);
    return JSON.parse(response) as GetPaymentMethodResponse;
  }

  /**
   * Callback Duitku API.
   *
   * Memvalidasi notifikasi callback dari Duitku.
   * Handle Method HTTP POST => Type x-www-form-urlencoded.
   *
   * **Perbedaan dari PHP:** Di PHP, callback membaca `$_POST` superglobal.
   * Di TypeScript, body harus diberikan sebagai parameter karena tidak ada
   * konsep global request body di Node.js/Bun.
   *
   * Signature validation: `md5(merchantCode + amount + merchantOrderId + apiKey)`
   *
   * @param body - Request body dari HTTP request (misal `req.body` di Express)
   * @param config - Konfigurasi Duitku
   * @returns Notifikasi callback yang sudah divalidasi
   * @throws {DuitkuError} Jika body kosong atau signature invalid
   *
   * @example
   * ```ts
   * // Express.js
   * app.post('/callback', express.urlencoded({ extended: true }), (req, res) => {
   *   try {
   *     const notification = Api.callback(req.body, config);
   *     if (notification.resultCode === '00') {
   *       // Action Success
   *     } else if (notification.resultCode === '01') {
   *       // Action Failed
   *     }
   *     res.json(notification);
   *   } catch (error) {
   *     res.status(400).json({ error: error.message });
   *   }
   * });
   * ```
   */
  static callback(body: Record<string, unknown>, config: Config): CallbackNotification {
    if (!body || Object.keys(body).length === 0) {
      throw new DuitkuError('Access denied');
    }

    Api.writeDuitkuLogsCallback('callback', JSON.stringify(body), config);

    // Pastikan semua expected params ada, set null jika tidak
    const notification: Record<string, unknown> = { ...body };
    for (const callbackParam of config.callbackParams) {
      if (!(callbackParam in notification)) {
        notification[callbackParam] = null;
      }
    }

    if (!Api.isSignatureValid(notification, config)) {
      throw new DuitkuError('Signature Invalid');
    }

    return notification as unknown as CallbackNotification;
  }

  /**
   * Validation signature callback Duitku API.
   *
   * Signature: `md5(merchantCode + amount + merchantOrderId + apiKey)`
   */
  private static isSignatureValid(notification: Record<string, unknown>, config: Config): boolean {
    const signature = String(notification['signature']);
    const signGenerate = md5(
      String(notification['merchantCode']) +
        String(notification['amount']) +
        String(notification['merchantOrderId']) +
        config.getApiKey()
    );
    return signature === signGenerate;
  }
}
