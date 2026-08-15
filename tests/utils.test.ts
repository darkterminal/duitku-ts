import { describe, it, expect } from 'vitest';
import { md5, sha256, formatDateTime, formatDate, timestampMs } from '../src/utils';

describe('md5', () => {
  it('should generate correct MD5 hash for callback signature (test vector from ParamsCallback.json)', () => {
    // Test vector dari tests/params/ParamsCallback.json
    // Formula callback signature: md5(merchantCode + amount + merchantOrderId + apiKey)
    const apiKey = '732B39FC61796845775D2C4FB05332AF';
    const merchantCode = 'D0001';
    const amount = '10000';
    const merchantOrderId = '12345';
    const expectedSignature = '4104f20a70c933113c66c004fe25a9f1';

    const result = md5(merchantCode + amount + merchantOrderId + apiKey);
    expect(result).toBe(expectedSignature);
  });

  it('should generate 32-character hex string', () => {
    const result = md5('test');
    expect(result).toHaveLength(32);
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should produce consistent hash for same input', () => {
    const input = 'consistent-input';
    expect(md5(input)).toBe(md5(input));
  });

  it('should produce different hash for different input', () => {
    expect(md5('input1')).not.toBe(md5('input2'));
  });
});

describe('sha256', () => {
  it('should generate 64-character hex string', () => {
    const result = sha256('test');
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should produce consistent hash for same input', () => {
    const input = 'consistent-input';
    expect(sha256(input)).toBe(sha256(input));
  });

  it('should produce different hash for different input', () => {
    expect(sha256('input1')).not.toBe(sha256('input2'));
  });

  it('should generate correct hash for Pop createInvoice signature format', () => {
    // Simulasi signature Pop.createInvoice: sha256(merchantCode + timestamp + apiKey)
    const merchantCode = 'D0001';
    const timestamp = 1723700000000;
    const apiKey = 'test-api-key';

    const result = sha256(merchantCode + timestamp + apiKey);

    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('formatDateTime', () => {
  it('should format date to Y-m-d H:i:s', () => {
    // Month di JavaScript 0-indexed: 7 = Agustus
    const date = new Date(2026, 7, 14, 10, 30, 45);
    expect(formatDateTime(date)).toBe('2026-08-14 10:30:45');
  });

  it('should pad single digit month, day, hour, minute, second', () => {
    const date = new Date(2026, 0, 5, 3, 7, 9); // Jan 5, 03:07:09
    expect(formatDateTime(date)).toBe('2026-01-05 03:07:09');
  });

  it('should handle midnight correctly', () => {
    const date = new Date(2026, 11, 31, 0, 0, 0); // Dec 31, 00:00:00
    expect(formatDateTime(date)).toBe('2026-12-31 00:00:00');
  });

  it('should handle end of day correctly', () => {
    const date = new Date(2026, 11, 31, 23, 59, 59); // Dec 31, 23:59:59
    expect(formatDateTime(date)).toBe('2026-12-31 23:59:59');
  });

  it('should return current datetime when no argument provided', () => {
    const result = formatDateTime();
    // Verifikasi format: YYYY-MM-DD HH:mm:ss
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('formatDate', () => {
  it('should format date to Ymd', () => {
    const date = new Date(2026, 7, 14); // Agustus = month 7 (0-indexed)
    expect(formatDate(date)).toBe('20260814');
  });

  it('should pad single digit month and day', () => {
    const date = new Date(2026, 0, 5); // Jan 5
    expect(formatDate(date)).toBe('20260105');
  });

  it('should return current date when no argument provided', () => {
    const result = formatDate();
    // Verifikasi format: YYYYMMDD
    expect(result).toMatch(/^\d{8}$/);
  });
});

describe('timestampMs', () => {
  it('should return a number', () => {
    expect(typeof timestampMs()).toBe('number');
  });

  it('should return value close to Date.now()', () => {
    const before = Date.now();
    const result = timestampMs();
    const after = Date.now();

    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  it('should return millisecond precision (13 digits for current era)', () => {
    const result = timestampMs();
    // Timestamp saat ini sekitar 1.7 triliun (13 digit)
    expect(result.toString().length).toBe(13);
  });
});
