/**
 * Send request and processing response for Duitku-Pop.
 *
 * Port dari `Duitku/Pop.php` ke TypeScript.
 *
 * @module Pop
 */

import { Request } from './Request';
import { Sanitizer } from './Sanitizer';
import { Config } from './Config';
import { DuitkuError } from './errors';
import { md5, sha256, formatDateTime, timestampMs } from './utils';
import type {
  CreateInvoiceParams,
  CreateInvoiceResponse,
  TransactionStatusResponse,
  GetPaymentMethodResponse,
  CallbackNotification,
} from './types';

export class Pop extends Request {
  /**
   * Create Invoice Duitku Pop.
   *
   * **Perbedaan dengan Api:**
   * - Signature menggunakan SHA256 dan dikirim via **HTTP Headers**.
   * - `paymentMethod` bersifat opsional.
   * - Menggunakan `getBaseUrl()` (Duitku-Pop URL).
   *
   * Signature: `sha256(merchantCode + timestamp + apiKey)`
   *
   * @param payload - Parameter invoice
   * @param config - Konfigurasi Duitku
   * @returns Response dari Duitku Pop
   * @throws {DuitkuError} Jika request gagal
   */
  static async createInvoice(
    payload: CreateInvoiceParams,
    config: Config
  ): Promise<CreateInvoiceResponse> {
    let sanitizedPayload = payload;
    if (config.getSanitizedMode()) {
      sanitizedPayload = Sanitizer.request(payload);
    }

    const timestamp = timestampMs();
    const signature = sha256(config.getMerchantCode() + timestamp + config.getApiKey());

    const params = JSON.stringify(sanitizedPayload);

    // Signature dikirim via headers, bukan di body
    const header = {
      'x-duitku-signature': signature,
      'x-duitku-timestamp': String(timestamp),
      'x-duitku-merchantcode': config.getMerchantCode(),
    };

    const setLogFunction = 'Pop->createInvoice';
    const url = config.getBaseUrl() + '/api/merchant/createInvoice';

    const response = await Pop.sendRequest(url, params, config, setLogFunction, header);
    return JSON.parse(response) as CreateInvoiceResponse;
  }

  /**
   * Cek Transaction Status Duitku Pop.
   *
   * Signature: `md5(merchantCode + merchantOrderId + apiKey)`
   *
   * @param merchantOrderId - Order ID dari merchant
   * @param config - Konfigurasi Duitku
   * @returns Status transaksi
   * @throws {DuitkuError} Jika request gagal
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
    const setLogFunction = 'Pop->transactionStatus';
    const url = config.getBaseUrl() + '/api/merchant/transactionStatus';

    const response = await Pop.sendRequest(url, params, config, setLogFunction);
    return JSON.parse(response) as TransactionStatusResponse;
  }

  /**
   * Get List Payment Method Duitku Pop.
   *
   * Signature: `sha256(merchantCode + paymentAmount + datetime + apiKey)`
   *
   * @param paymentAmount - Amount transaksi
   * @param config - Konfigurasi Duitku
   * @returns Daftar metode pembayaran
   * @throws {DuitkuError} Jika request gagal
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
    const setLogFunction = 'Pop->getPaymentMethod';

    // Catatan: Di PHP Pop.php, getPaymentMethod menggunakan getApiUrl() (endpoint api v2)
    const url = config.getApiUrl() + '/webapi/api/merchant/paymentmethod/getpaymentmethod';

    const response = await Pop.sendRequest(url, params, config, setLogFunction);
    return JSON.parse(response) as GetPaymentMethodResponse;
  }

  /**
   * Callback Duitku Pop.
   *
   * Logic validasi signature identik dengan Api.callback().
   *
   * @param body - Request body dari HTTP request
   * @param config - Konfigurasi Duitku
   * @returns Notifikasi callback yang sudah divalidasi
   * @throws {DuitkuError} Jika body kosong atau signature invalid
   */
  static callback(body: Record<string, unknown>, config: Config): CallbackNotification {
    if (!body || Object.keys(body).length === 0) {
      throw new DuitkuError('Access denied');
    }

    Pop.writeDuitkuLogsCallback('callback', JSON.stringify(body), config);

    const notification: Record<string, unknown> = { ...body };
    for (const callbackParam of config.callbackParams) {
      if (!(callbackParam in notification)) {
        notification[callbackParam] = null;
      }
    }

    if (!Pop.isSignatureValid(notification, config)) {
      throw new DuitkuError('Signature Invalid');
    }

    return notification as unknown as CallbackNotification;
  }

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
