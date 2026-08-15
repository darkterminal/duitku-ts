/**
 * Utility functions untuk SDK Duitku.
 *
 * Module ini menyediakan fungsi-fungsi helper yang diperlukan
 * oleh Api, Pop, Config, dan Request untuk menghasilkan
 * signature dan format datetime yang identik dengan PHP SDK.
 *
 * @module utils
 */

import { createHash } from 'node:crypto';

/**
 * Menghasilkan hash MD5 dalam format hexadecimal.
 *
 * Pengganti fungsi `md5()` di PHP.
 *
 * @param str - String yang akan di-hash
 * @returns Hash MD5 dalam format hex (32 karakter)
 *
 * @example
 * ```ts
 * const hash = md5('D0001' + '10000' + '12345' + apiKey);
 * // => '4104f20a70c933113c66c004fe25a9f1'
 * ```
 */
export function md5(str: string): string {
  return createHash('md5').update(str).digest('hex');
}

/**
 * Menghasilkan hash SHA256 dalam format hexadecimal.
 *
 * Pengganti fungsi `hash('sha256', ...)` di PHP.
 *
 * @param str - String yang akan di-hash
 * @returns Hash SHA256 dalam format hex (64 karakter)
 *
 * @example
 * ```ts
 * const signature = sha256(merchantCode + timestamp + apiKey);
 * ```
 */
export function sha256(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}

/**
 * Memformat Date menjadi string dengan format 'YYYY-MM-DD HH:mm:ss'.
 *
 * Pengganti fungsi `date('Y-m-d H:i:s')` di PHP.
 * Menggunakan timezone lokal system, sama seperti PHP `date()`.
 *
 * @param date - Date object yang akan diformat (default: sekarang)
 * @returns String dengan format 'YYYY-MM-DD HH:mm:ss'
 *
 * @example
 * ```ts
 * formatDateTime(new Date(2026, 7, 14, 10, 30, 45));
 * // => '2026-08-14 10:30:45'
 * ```
 */
export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}` +
    `-${pad(date.getMonth() + 1)}` +
    `-${pad(date.getDate())} ` +
    `${pad(date.getHours())}` +
    `:${pad(date.getMinutes())}` +
    `:${pad(date.getSeconds())}`
  );
}

/**
 * Memformat Date menjadi string dengan format 'YYYYMMDD'.
 *
 * Pengganti fungsi `date('Ymd')` di PHP.
 * Digunakan untuk menghasilkan nama file log.
 *
 * @param date - Date object yang akan diformat (default: sekarang)
 * @returns String dengan format 'YYYYMMDD'
 *
 * @example
 * ```ts
 * formatDate(new Date(2026, 7, 14));
 * // => '20260814'
 * ```
 */
export function formatDate(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}` + `${pad(date.getMonth() + 1)}` + `${pad(date.getDate())}`;
}

/**
 * Menghasilkan timestamp dalam milisecond.
 *
 * Pengganti `round(microtime(true) * 1000)` di PHP.
 *
 * @returns Timestamp dalam milisecond sejak Unix epoch
 *
 * @example
 * ```ts
 * const timestamp = timestampMs();
 * // => 1723700000000
 * ```
 */
export function timestampMs(): number {
  return Date.now();
}
