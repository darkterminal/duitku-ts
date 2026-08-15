/**
 * Execute requests and write logs.
 *
 * Port dari `Duitku/Request.php` ke TypeScript.
 * Menggunakan native `fetch` (tersedia di Node.js 18+ dan Bun)
 * sebagai pengganti cURL.
 *
 * @module Request
 */

import { mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Config } from './Config';
import { DuitkuError } from './errors';
import { formatDateTime } from './utils';

export class Request {
  /**
   * Fungsi untuk mengirim HTTP POST request.
   *
   * Pengganti `sendRequest` di PHP yang menggunakan cURL.
   * Menggunakan native `fetch` yang tersedia di Node.js 18+ dan Bun.
   *
   * @param url - URL endpoint Duitku API
   * @param params - JSON string payload request
   * @param config - Konfigurasi Duitku
   * @param setLogFunction - Nama fungsi untuk logging (contoh: "Pop->createInvoice")
   * @param headerParam - Header tambahan (opsional, contoh: signature untuk Pop)
   * @returns Response body sebagai string
   * @throws {DuitkuError} Jika HTTP status >= 400
   *
   * @example
   * ```ts
   * const response = await Request.sendRequest(
   *   'https://api-sandbox.duitku.com/api/merchant/createInvoice',
   *   JSON.stringify(payload),
   *   config,
   *   'Pop->createInvoice'
   * );
   * ```
   */
  protected static async sendRequest(
    url: string,
    params: string,
    config: Config,
    setLogFunction: string,
    headerParam: Record<string, string> = {}
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // Catatan: JANGAN set Content-Length manual.
      // fetch akan menghitung dan men-set otomatis.
      // Di PHP cURL, Content-Length di-set manual, tapi di fetch
      // hal ini bisa menyebabkan error di beberapa runtime.
      ...headerParam,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: params,
    });

    const responseBody = await response.text();

    // Tulis log setelah request selesai (sama seperti PHP)
    Request.writeDuitkuLogs(setLogFunction, url, 'POST', params, responseBody, config);

    // Jika HTTP status >= 400, throw error (sama seperti PHP)
    if (response.status >= 400) {
      throw new DuitkuError(
        `Duitku Error: ${response.status} response: ${responseBody}`,
        response.status,
        responseBody
      );
    }

    return responseBody;
  }

  /**
   * Tulis log untuk request Duitku.
   *
   * Log akan ditulis jika `config.getDuitkuLogs()` mengembalikan `true`
   * dan `logRequest` tidak kosong.
   *
   * Format log:
   * ```
   * Date:YYYY-MM-DD HH:mm:ss
   * METHOD:POST
   * FUNCTION:Pop->createInvoice
   * URL:https://api-sandbox.duitku.com/api/merchant/createInvoice
   * REQUEST:{...json payload...}
   * RESPONSE:{...json response...}
   * ```
   *
   * @param setLogFunction - Nama fungsi yang memanggil (contoh: "Pop->createInvoice")
   * @param url - URL endpoint
   * @param method - HTTP method (contoh: "POST")
   * @param logRequest - Request payload (JSON string)
   * @param logResponse - Response body
   * @param config - Konfigurasi Duitku
   */
  protected static writeDuitkuLogs(
    setLogFunction: string,
    url: string,
    method: string,
    logRequest: string,
    logResponse: string,
    config: Config
  ): void {
    if (config.getDuitkuLogs()) {
      if (logRequest) {
        Request.writeLogs(config, `Date:${formatDateTime()}`);
        Request.writeLogs(config, `METHOD:${method}`);
        Request.writeLogs(config, `FUNCTION:${setLogFunction}`);
        Request.writeLogs(config, `URL:${url}`);
        Request.writeLogs(config, 'REQUEST:', logRequest);
        Request.writeLogs(config, 'RESPONSE:', logResponse + '\r\n');
      }
    }
  }

  /**
   * Tulis log khusus untuk callback.
   *
   * Dipanggil oleh `Pop.callback()` dan `Api.callback()` untuk
   * mencatat notifikasi callback yang diterima dari Duitku.
   *
   * Format log:
   * ```
   * Date:YYYY-MM-DD HH:mm:ss
   * URL:callback
   * CALLBACK REQUEST:{...json payload...}
   * ```
   *
   * @param url - Identifier callback (di PHP menggunakan `$_SERVER['PHP_SELF']`)
   * @param logRequest - Callback payload (JSON string)
   * @param config - Konfigurasi Duitku
   */
  protected static writeDuitkuLogsCallback(url: string, logRequest: string, config: Config): void {
    if (config.getDuitkuLogs()) {
      if (logRequest) {
        Request.writeLogs(config, `Date:${formatDateTime()}`);
        Request.writeLogs(config, `URL:${url}`);
        Request.writeLogs(config, 'CALLBACK REQUEST:', logRequest + '\r\n');
      }
    }
  }

  /**
   * Tulis satu baris log ke file.
   *
   * File log disimpan di `{process.cwd()}/logs/duitku_YYYYMMDD.log`.
   * Directory `logs` akan dibuat otomatis jika belum ada.
   *
   * @param config - Konfigurasi Duitku (untuk mendapatkan nama file log)
   * @param logTitle - Judul/prefix log (contoh: "REQUEST:")
   * @param logMessage - Isi log (opsional)
   */
  private static writeLogs(config: Config, logTitle: string, logMessage = ''): void {
    // Gunakan process.cwd() sebagai base directory untuk log.
    // Ini konsisten di Node.js dan Bun, berbeda dengan PHP yang
    // menggunakan __DIR__ (relative ke file Request.php).
    const rootDirLogs = join(process.cwd(), 'logs');

    // Buat directory logs jika belum ada
    if (!existsSync(rootDirLogs)) {
      mkdirSync(rootDirLogs);
    }

    const logFile = join(rootDirLogs, config.getLogFileName());
    const content = `${logTitle}${logMessage}\r\n`;

    // Append ke file log (setara dengan FILE_APPEND di PHP)
    appendFileSync(logFile, content);
  }
}
