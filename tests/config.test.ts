import { describe, it, expect } from 'vitest';
import { Config } from '../src/Config';

describe('Config', () => {
  // ============================================================
  // Constructor & Default Values
  // ============================================================

  describe('constructor', () => {
    it('should create config with default values', () => {
      const config = new Config('test-api-key', 'D0001');

      expect(config.getApiKey()).toBe('test-api-key');
      expect(config.getMerchantCode()).toBe('D0001');
      expect(config.getSandboxMode()).toBe(true);
      expect(config.getSanitizedMode()).toBe(true);
      expect(config.getDuitkuLogs()).toBe(true);
    });

    it('should create config with custom values', () => {
      const config = new Config('my-key', 'M0001', false, false, false);

      expect(config.getApiKey()).toBe('my-key');
      expect(config.getMerchantCode()).toBe('M0001');
      expect(config.getSandboxMode()).toBe(false);
      expect(config.getSanitizedMode()).toBe(false);
      expect(config.getDuitkuLogs()).toBe(false);
    });

    it('should create config with partial custom values', () => {
      const config = new Config('my-key', 'M0001', false);

      expect(config.getSandboxMode()).toBe(false);
      expect(config.getSanitizedMode()).toBe(true); // default
      expect(config.getDuitkuLogs()).toBe(true); // default
    });
  });

  // ============================================================
  // Getters & Setters
  // ============================================================

  describe('getters and setters', () => {
    it('should set and get apiKey', () => {
      const config = new Config('initial-key', 'D0001');
      config.setApiKey('new-key');
      expect(config.getApiKey()).toBe('new-key');
    });

    it('should set and get merchantCode', () => {
      const config = new Config('key', 'D0001');
      config.setMerchantCode('M9999');
      expect(config.getMerchantCode()).toBe('M9999');
    });

    it('should set and get sandboxMode', () => {
      const config = new Config('key', 'D0001', true);
      expect(config.getSandboxMode()).toBe(true);

      config.setSandboxMode(false);
      expect(config.getSandboxMode()).toBe(false);
    });

    it('should set and get sanitizedMode', () => {
      const config = new Config('key', 'D0001');
      expect(config.getSanitizedMode()).toBe(true);

      config.setSanitizedMode(false);
      expect(config.getSanitizedMode()).toBe(false);
    });

    it('should set and get duitkuLogs', () => {
      const config = new Config('key', 'D0001');
      expect(config.getDuitkuLogs()).toBe(true);

      config.setDuitkuLogs(false);
      expect(config.getDuitkuLogs()).toBe(false);
    });
  });

  // ============================================================
  // URL Constants & Getters
  // ============================================================

  describe('URL constants', () => {
    it('should have correct SANDBOX_URL', () => {
      expect(Config.SANDBOX_URL).toBe('https://api-sandbox.duitku.com');
    });

    it('should have correct PASSPORT_URL', () => {
      expect(Config.PASSPORT_URL).toBe('https://api-prod.duitku.com');
    });

    it('should have correct SANDBOX_API_URL', () => {
      expect(Config.SANDBOX_API_URL).toBe('https://sandbox.duitku.com');
    });

    it('should have correct PASSPORT_API_URL', () => {
      expect(Config.PASSPORT_API_URL).toBe('https://passport.duitku.com');
    });
  });

  describe('getApiUrl', () => {
    it('should return SANDBOX_API_URL when sandbox mode is true', () => {
      const config = new Config('key', 'D0001', true);
      expect(config.getApiUrl()).toBe('https://sandbox.duitku.com');
    });

    it('should return PASSPORT_API_URL when sandbox mode is false', () => {
      const config = new Config('key', 'D0001', false);
      expect(config.getApiUrl()).toBe('https://passport.duitku.com');
    });

    it('should reflect sandboxMode change', () => {
      const config = new Config('key', 'D0001', true);
      expect(config.getApiUrl()).toBe('https://sandbox.duitku.com');

      config.setSandboxMode(false);
      expect(config.getApiUrl()).toBe('https://passport.duitku.com');
    });
  });

  describe('getBaseUrl', () => {
    it('should return SANDBOX_URL when sandbox mode is true', () => {
      const config = new Config('key', 'D0001', true);
      expect(config.getBaseUrl()).toBe('https://api-sandbox.duitku.com');
    });

    it('should return PASSPORT_URL when sandbox mode is false', () => {
      const config = new Config('key', 'D0001', false);
      expect(config.getBaseUrl()).toBe('https://api-prod.duitku.com');
    });

    it('should reflect sandboxMode change', () => {
      const config = new Config('key', 'D0001', true);
      expect(config.getBaseUrl()).toBe('https://api-sandbox.duitku.com');

      config.setSandboxMode(false);
      expect(config.getBaseUrl()).toBe('https://api-prod.duitku.com');
    });
  });

  // ============================================================
  // Callback Params
  // ============================================================

  describe('callbackParams', () => {
    it('should have 11 callback parameters', () => {
      const config = new Config('key', 'D0001');
      expect(config.callbackParams).toHaveLength(11);
    });

    it('should contain all expected parameters', () => {
      const config = new Config('key', 'D0001');
      const expectedParams = [
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
      ];

      for (const param of expectedParams) {
        expect(config.callbackParams).toContain(param);
      }
    });

    it('should have parameters in correct order', () => {
      const config = new Config('key', 'D0001');
      expect(config.callbackParams[0]).toBe('merchantCode');
      expect(config.callbackParams[1]).toBe('amount');
      expect(config.callbackParams[2]).toBe('merchantOrderId');
      expect(config.callbackParams[3]).toBe('productDetail');
      expect(config.callbackParams[4]).toBe('additionalParam');
      expect(config.callbackParams[5]).toBe('paymentCode');
      expect(config.callbackParams[6]).toBe('resultCode');
      expect(config.callbackParams[7]).toBe('merchantUserId');
      expect(config.callbackParams[8]).toBe('reference');
      expect(config.callbackParams[9]).toBe('signature');
      expect(config.callbackParams[10]).toBe('spUserHash');
    });

    it('should be readonly (immutable)', () => {
      const config = new Config('key', 'D0001');
      // TypeScript akan error jika mencoba mutate, tapi kita test runtime behavior
      expect(() => {
        // @ts-expect-error - testing runtime immutability
        config.callbackParams.push('newParam');
      }).toThrow();
    });
  });

  // ============================================================
  // Log File Name
  // ============================================================

  describe('getLogFileName', () => {
    it('should return log file name with format duitku_YYYYMMDD.log', () => {
      const config = new Config('key', 'D0001');
      const logFileName = config.getLogFileName();

      expect(logFileName).toMatch(/^duitku_\d{8}\.log$/);
    });

    it('should start with duitku_ prefix', () => {
      const config = new Config('key', 'D0001');
      expect(config.getLogFileName()).toMatch(/^duitku_/);
    });

    it('should end with .log extension', () => {
      const config = new Config('key', 'D0001');
      expect(config.getLogFileName()).toMatch(/\.log$/);
    });
  });
});
