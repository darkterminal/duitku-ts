import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Api } from '../src/Api';
import { Config } from '../src/Config';
import { DuitkuError } from '../src/errors';
import paramsCallback from './params/ParamsCallback.json';

// Mock node:fs untuk menghindari penulisan log ke disk
vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
}));

describe('Api', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ============================================================
  // createInvoice
  // ============================================================

  describe('createInvoice', () => {
    it('should send request with MD5 signature in body', async () => {
      const mockResponse = {
        statusCode: '00',
        statusMessage: 'SUCCESS',
        merchantCode: 'D0001',
        reference: 'D0001ABC123',
        paymentUrl: 'https://sandbox.duitku.com/payment/123',
      };

      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      const params = {
        paymentAmount: 10000,
        paymentMethod: 'BT',
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
      };

      const response = await Api.createInvoice(params, config);

      // Verify response
      expect(response.statusCode).toBe('00');
      expect(response.statusMessage).toBe('SUCCESS');
      expect(response.merchantCode).toBe('D0001');
      expect(response.reference).toBe('D0001ABC123');
      expect(response.paymentUrl).toBe('https://sandbox.duitku.com/payment/123');

      // Verify request
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry');
      expect(options.method).toBe('POST');

      // Verify body contains merchantCode and signature
      const body = JSON.parse(options.body);
      expect(body.merchantCode).toBe('D0001');
      expect(body.signature).toBeDefined();
      expect(body.signature).toHaveLength(32); // MD5 hex length
      expect(body.paymentMethod).toBe('BT');
    });

    it('should sanitize payload when sanitizedMode is enabled', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ statusCode: '00' }),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setSanitizedMode(true);
      config.setDuitkuLogs(false);

      const params = {
        paymentAmount: '10000' as unknown as number, // string, should be cast to int
        paymentMethod: 'BT',
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
        phoneNumber: '+62 812-3456-7890',
      };

      await Api.createInvoice(params, config);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      // paymentAmount should be sanitized to int
      expect(body.paymentAmount).toBe(10000);
      // phoneNumber should be sanitized
      expect(body.phoneNumber).toBe('62812-3456-7890');
    });

    it('should NOT sanitize payload when sanitizedMode is disabled', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ statusCode: '00' }),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setSanitizedMode(false);
      config.setDuitkuLogs(false);

      const params = {
        paymentAmount: 10000,
        paymentMethod: 'BT',
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
        phoneNumber: '+62 812-3456-7890',
      };

      await Api.createInvoice(params, config);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);

      // phoneNumber should NOT be sanitized
      expect(body.phoneNumber).toBe('+62 812-3456-7890');
    });

    it('should throw DuitkuError when API returns error', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        text: async () => 'Bad Request',
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      const params = {
        paymentAmount: 10000,
        paymentMethod: 'BT',
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
      };

      await expect(Api.createInvoice(params, config)).rejects.toThrow(DuitkuError);
    });
  });

  // ============================================================
  // transactionStatus
  // ============================================================

  describe('transactionStatus', () => {
    it('should send request with MD5 signature', async () => {
      const mockResponse = {
        statusCode: '00',
        statusMessage: 'SUCCESS',
        merchantOrderId: 'order-001',
        reference: 'D0001ABC123',
        amount: 10000,
        fee: 4000,
      };

      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      const response = await Api.transactionStatus('order-001', config);

      expect(response.statusCode).toBe('00');
      expect(response.merchantOrderId).toBe('order-001');
      expect(response.amount).toBe(10000);
      expect(response.fee).toBe(4000);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://sandbox.duitku.com/webapi/api/merchant/transactionStatus');

      const body = JSON.parse(options.body);
      expect(body.merchantCode).toBe('D0001');
      expect(body.merchantOrderId).toBe('order-001');
      expect(body.signature).toHaveLength(32); // MD5
    });

    it('should use correct URL for production mode', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ statusCode: '00' }),
      });

      const config = new Config('test-api-key', 'D0001', false); // production
      config.setDuitkuLogs(false);

      await Api.transactionStatus('order-001', config);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('https://passport.duitku.com/webapi/api/merchant/transactionStatus');
    });
  });

  // ============================================================
  // getPaymentMethod
  // ============================================================

  describe('getPaymentMethod', () => {
    it('should send request with SHA256 signature and datetime', async () => {
      const mockResponse = {
        responseCode: '00',
        responseMessage: 'SUCCESS',
        paymentFee: [
          { name: 'Permata Bank Virtual Account', code: 'BT', fee: 4000 },
          { name: 'BCA Virtual Account', code: 'BC', fee: 4000 },
        ],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      const response = await Api.getPaymentMethod(10000, config);

      expect(response.responseCode).toBe('00');
      expect(response.paymentFee).toHaveLength(2);
      expect(response.paymentFee[0].code).toBe('BT');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe(
        'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
      );

      const body = JSON.parse(options.body);
      expect(body.merchantCode).toBe('D0001');
      expect(body.amount).toBe(10000);
      expect(body.datetime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(body.signature).toHaveLength(64); // SHA256
    });

    it('should accept string paymentAmount', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ responseCode: '00', paymentFee: [] }),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      await Api.getPaymentMethod('10000', config);

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.amount).toBe('10000');
    });
  });

  // ============================================================
  // callback
  // ============================================================

  describe('callback', () => {
    it('should validate signature and return notification (test vector from ParamsCallback.json)', () => {
      const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001', true);
      config.setDuitkuLogs(false);

      const notification = Api.callback(paramsCallback, config);

      expect(notification.resultCode).toBe('00');
      expect(notification.merchantOrderId).toBe('12345');
      expect(notification.reference).toBe('D00015HL5BJKRM27MCUS');
      expect(notification.merchantCode).toBe('D0001');
      expect(notification.amount).toBe(10000);
      expect(notification.signature).toBe('4104f20a70c933113c66c004fe25a9f1');
    });

    it('should set missing params to null', () => {
      const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001', true);
      config.setDuitkuLogs(false);

      const notification = Api.callback(paramsCallback, config);

      // ParamsCallback.json tidak memiliki merchantUserId dan spUserHash
      // Mereka harus di-set menjadi null
      expect(notification.merchantUserId).toBeNull();
      expect(notification.spUserHash).toBeNull();
    });

    it('should throw Access denied for empty body', () => {
      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      expect(() => Api.callback({}, config)).toThrow('Access denied');
      expect(() => Api.callback({}, config)).toThrow(DuitkuError);
    });

    it('should throw Signature Invalid for wrong signature', () => {
      const config = new Config('wrong-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      expect(() => Api.callback(paramsCallback, config)).toThrow('Signature Invalid');
      expect(() => Api.callback(paramsCallback, config)).toThrow(DuitkuError);
    });

    it('should throw Signature Invalid for tampered data', () => {
      const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001', true);
      config.setDuitkuLogs(false);

      const tamperedParams = { ...paramsCallback, amount: 99999 };

      expect(() => Api.callback(tamperedParams, config)).toThrow('Signature Invalid');
    });
  });
});
