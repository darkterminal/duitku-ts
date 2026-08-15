/**
 * Managing Duitku configurations.
 *
 * Port dari `Duitku/Config.php` ke TypeScript.
 * Class ini mengelola semua konfigurasi yang diperlukan untuk
 * berkomunikasi dengan Duitku API, termasuk API key, merchant code,
 * mode sandbox/production, dan pengaturan logging.
 *
 * @module Config
 */

import { formatDate } from './utils';

export class Config {
  /**
   * Your merchant's API key.
   * Didapat dari Duitku dashboard.
   */
  private _apiKey: string;

  /**
   * Your merchant's merchant code.
   * Didapat dari Duitku dashboard.
   */
  private _merchantCode: string;

  /**
   * Mode operasi.
   * `true` untuk sandbox (testing), `false` untuk production.
   */
  private _isSandboxMode: boolean;

  /**
   * Enable request params sanitized mode.
   * Default: `true`.
   */
  private _isSanitizedMode: boolean;

  /**
   * Set `true` to enable log file.
   * Default: `true`.
   */
  private _duitkuLogs: boolean;

  /**
   * Daftar parameter yang diharapkan ada dalam callback notification.
   * Jika parameter tidak ada, akan di-set menjadi `null`.
   *
   * Sesuai dengan `Config.php` -> `$callbackParams`.
   */
  public readonly callbackParams: readonly string[] = Object.freeze([
    'merchantCode',
    'amount',
    'merchantOrderId',
    'productDetail',
    'additionalParam',
    'paymentCode',
    'resultCode',
    'merchantUserId',
    'reference',
    'signature',
    'spUserHash',
  ]);

  // ============================================================
  // URL Constants
  // ============================================================

  /** Base URL untuk Duitku-Pop (sandbox) */
  static readonly SANDBOX_URL = 'https://api-sandbox.duitku.com';

  /** Base URL untuk Duitku-Pop (production) */
  static readonly PASSPORT_URL = 'https://api-prod.duitku.com';

  /** Base URL untuk Duitku-API (sandbox) */
  static readonly SANDBOX_API_URL = 'https://sandbox.duitku.com';

  /** Base URL untuk Duitku-API (production) */
  static readonly PASSPORT_API_URL = 'https://passport.duitku.com';

  /**
   * Membuat instance Config baru.
   *
   * @param apiKey - Your merchant's API key
   * @param merchantCode - Your merchant's merchant code
   * @param isSandboxMode - `true` untuk sandbox, `false` untuk production (default: `true`)
   * @param isSanitizedMode - Enable sanitasi parameter request (default: `true`)
   * @param duitkuLogs - Enable penulisan log ke file (default: `true`)
   *
   * @example
   * ```ts
   * import { Config } from 'duitku';
   *
   * // Sandbox mode (default)
   * const config = new Config('YOUR_MERCHANT_KEY', 'YOUR_MERCHANT_CODE');
   *
   * // Production mode
   * const config = new Config('YOUR_MERCHANT_KEY', 'YOUR_MERCHANT_CODE', false);
   *
   * // Custom settings
   * const config = new Config('YOUR_MERCHANT_KEY', 'YOUR_MERCHANT_CODE', true, true, false);
   * config.setSanitizedMode(false);
   * config.setDuitkuLogs(false);
   * ```
   */
  constructor(
    apiKey: string,
    merchantCode: string,
    isSandboxMode: boolean = true,
    isSanitizedMode: boolean = true,
    duitkuLogs: boolean = true
  ) {
    this._apiKey = apiKey;
    this._merchantCode = merchantCode;
    this._isSandboxMode = isSandboxMode;
    this._isSanitizedMode = isSanitizedMode;
    this._duitkuLogs = duitkuLogs;
  }

  // ============================================================
  // Getters & Setters: apiKey
  // ============================================================

  /**
   * Get apiKey config.
   */
  getApiKey(): string {
    return this._apiKey;
  }

  /**
   * Set apiKey config.
   */
  setApiKey(apiKey: string): void {
    this._apiKey = apiKey;
  }

  // ============================================================
  // Getters & Setters: merchantCode
  // ============================================================

  /**
   * Get merchantCode config.
   */
  getMerchantCode(): string {
    return this._merchantCode;
  }

  /**
   * Set merchantCode config.
   */
  setMerchantCode(merchantCode: string): void {
    this._merchantCode = merchantCode;
  }

  // ============================================================
  // Getters & Setters: isSandboxMode
  // ============================================================

  /**
   * Get sandboxMode config.
   * `true` = sandbox, `false` = production.
   */
  getSandboxMode(): boolean {
    return this._isSandboxMode;
  }

  /**
   * Set sandboxMode config.
   * @param isSandboxMode - `false` for production, `true` for sandbox
   */
  setSandboxMode(isSandboxMode: boolean): void {
    this._isSandboxMode = isSandboxMode;
  }

  // ============================================================
  // Getters & Setters: isSanitizedMode
  // ============================================================

  /**
   * Get sanitizedMode config.
   */
  getSanitizedMode(): boolean {
    return this._isSanitizedMode;
  }

  /**
   * Set sanitizedMode config.
   */
  setSanitizedMode(isSanitizedMode: boolean): void {
    this._isSanitizedMode = isSanitizedMode;
  }

  // ============================================================
  // Getters & Setters: duitkuLogs
  // ============================================================

  /**
   * Get duitkuLogs config.
   */
  getDuitkuLogs(): boolean {
    return this._duitkuLogs;
  }

  /**
   * Set duitkuLogs config.
   */
  setDuitkuLogs(duitkuLogs: boolean): void {
    this._duitkuLogs = duitkuLogs;
  }

  // ============================================================
  // URL Getters
  // ============================================================

  /**
   * Get Duitku API URL, depends on `isSandboxMode`.
   *
   * - Sandbox: `https://sandbox.duitku.com`
   * - Production: `https://passport.duitku.com`
   *
   * Digunakan oleh `Api` class.
   */
  getApiUrl(): string {
    return this.getSandboxMode() ? Config.SANDBOX_API_URL : Config.PASSPORT_API_URL;
  }

  /**
   * Get Duitku POP URL, depends on `isSandboxMode`.
   *
   * - Sandbox: `https://api-sandbox.duitku.com`
   * - Production: `https://api-prod.duitku.com`
   *
   * Digunakan oleh `Pop` class.
   */
  getBaseUrl(): string {
    return this.getSandboxMode() ? Config.SANDBOX_URL : Config.PASSPORT_URL;
  }

  // ============================================================
  // Log File Name
  // ============================================================

  /**
   * Generate string log file name.
   *
   * Format: `duitku_YYYYMMDD.log`
   *
   * @returns Nama file log, contoh: `duitku_20260815.log`
   */
  getLogFileName(): string {
    return `duitku_${formatDate()}.log`;
  }
}
