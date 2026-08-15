import { describe, it, expect } from 'vitest';
import * as Duitku from '../src/index';

describe('Public API (index.ts)', () => {
  // ============================================================
  // Version
  // ============================================================

  describe('VERSION', () => {
    it('should be defined and be a string', () => {
      expect(Duitku.VERSION).toBeDefined();
      expect(typeof Duitku.VERSION).toBe('string');
      expect(Duitku.VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  // ============================================================
  // Core Classes
  // ============================================================

  describe('Core classes', () => {
    it('should export Config class', () => {
      expect(Duitku.Config).toBeDefined();
      expect(typeof Duitku.Config).toBe('function');
      const config = new Duitku.Config('key', 'D0001');
      expect(config).toBeInstanceOf(Duitku.Config);
    });

    it('should export Sanitizer class', () => {
      expect(Duitku.Sanitizer).toBeDefined();
      expect(typeof Duitku.Sanitizer).toBe('function');
      expect(typeof Duitku.Sanitizer.request).toBe('function');
    });

    it('should export Api class with all methods', () => {
      expect(Duitku.Api).toBeDefined();
      expect(typeof Duitku.Api.createInvoice).toBe('function');
      expect(typeof Duitku.Api.transactionStatus).toBe('function');
      expect(typeof Duitku.Api.getPaymentMethod).toBe('function');
      expect(typeof Duitku.Api.callback).toBe('function');
    });

    it('should export Pop class with all methods', () => {
      expect(Duitku.Pop).toBeDefined();
      expect(typeof Duitku.Pop.createInvoice).toBe('function');
      expect(typeof Duitku.Pop.transactionStatus).toBe('function');
      expect(typeof Duitku.Pop.getPaymentMethod).toBe('function');
      expect(typeof Duitku.Pop.callback).toBe('function');
    });

    it('should export Request class', () => {
      expect(Duitku.Request).toBeDefined();
      expect(typeof Duitku.Request).toBe('function');
    });
  });

  // ============================================================
  // Errors
  // ============================================================

  describe('Errors', () => {
    it('should export DuitkuError class', () => {
      expect(Duitku.DuitkuError).toBeDefined();
      expect(typeof Duitku.DuitkuError).toBe('function');
      const err = new Duitku.DuitkuError('test');
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(Duitku.DuitkuError);
    });
  });

  // ============================================================
  // Integration: Full workflow simulation
  // ============================================================

  describe('Integration workflow', () => {
    it('should be able to instantiate config and call callback synchronously', () => {
      // Simulasi callback validation flow
      const config = new Duitku.Config('732B39FC61796845775D2C4FB05332AF', 'D0001', true);
      config.setDuitkuLogs(false);

      const body = {
        merchantCode: 'D0001',
        amount: 10000,
        merchantOrderId: '12345',
        signature: '4104f20a70c933113c66c004fe25a9f1',
      };

      const notification = Duitku.Pop.callback(body, config);
      expect(notification.merchantCode).toBe('D0001');
      expect(notification.amount).toBe(10000);
    });

    it('should allow Sanitizer to clean params', () => {
      const params = {
        paymentAmount: '10000',
        phoneNumber: '+62 812-3456-7890',
      };

      const cleaned = Duitku.Sanitizer.request(params);
      expect(cleaned.paymentAmount).toBe(10000);
      expect(cleaned.phoneNumber).toBe('62812-3456-7890');
    });
  });
});
