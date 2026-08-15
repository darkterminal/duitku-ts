/**
 * Custom error class untuk SDK Duitku.
 *
 * Digunakan untuk semua error yang berasal dari SDK, termasuk:
 * - HTTP error (status >= 400) dari Duitku API
 * - Callback validation error (Access denied, Signature Invalid)
 * - Configuration error
 */
export class DuitkuError extends Error {
  /**
   * HTTP status code dari response Duitku API (jika ada).
   * Contoh: 400, 401, 500.
   */
  public readonly statusCode?: number;

  /**
   * Raw response body dari Duitku API (jika ada).
   * Berguna untuk debugging.
   */
  public readonly responseBody?: string;

  constructor(message: string, statusCode?: number, responseBody?: string) {
    super(message);
    this.name = 'DuitkuError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;

    // Maintain proper prototype chain for instanceof checks
    // (diperlukan ketika target ES5/ES2015, tapi tetap good practice)
    Object.setPrototypeOf(this, DuitkuError.prototype);
  }
}
