import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Pop } from '../src/Pop';
import { Config } from '../src/Config';
import paramsCallback from './params/ParamsCallback.json';

// Mock node:fs untuk menghindari penulisan log ke disk
vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
}));

describe('Pop', () => {
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
    it('should send request with SHA256 signature in HEADERS', async () => {
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
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
      };

      const response = await Pop.createInvoice(params, config);

      expect(response.statusCode).toBe('00');
      expect(response.paymentUrl).toBe('https://sandbox.duitku.com/payment/123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api-sandbox.duitku.com/api/merchant/createInvoice');

      // Verify headers
      expect(options.headers['x-duitku-merchantcode']).toBe('D0001');
      expect(options.headers['x-duitku-signature']).toHaveLength(64); // SHA256
      expect(options.headers['x-duitku-timestamp']).toBeDefined();

      // Verify body does NOT contain signature or merchantCode
      const body = JSON.parse(options.body);
      expect(body.signature).toBeUndefined();
      expect(body.merchantCode).toBeUndefined();
    });

    it('should use correct URL for production mode', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ statusCode: '00' }),
      });

      const config = new Config('test-api-key', 'D0001', false); // production
      config.setDuitkuLogs(false);

      const params = {
        paymentAmount: 10000,
        merchantOrderId: 'order-001',
        productDetails: 'Test Payment',
      };

      await Pop.createInvoice(params, config);

      const [url] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api-prod.duitku.com/api/merchant/createInvoice');
    });
  });

  // ============================================================
  // transactionStatus
  // ============================================================

  describe('transactionStatus', () => {
    it('should send request with MD5 signature in body', async () => {
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

      const response = await Pop.transactionStatus('order-001', config);

      expect(response.statusCode).toBe('00');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api-sandbox.duitku.com/api/merchant/transactionStatus');

      const body = JSON.parse(options.body);
      expect(body.merchantCode).toBe('D0001');
      expect(body.merchantOrderId).toBe('order-001');
      expect(body.signature).toHaveLength(32); // MD5
    });
  });

  // ============================================================
  // getPaymentMethod
  // ============================================================

  describe('getPaymentMethod', () => {
    it('should send request to getApiUrl (not getBaseUrl)', async () => {
      const mockResponse = {
        responseCode: '00',
        responseMessage: 'SUCCESS',
        paymentFee: [{ name: 'Permata Bank Virtual Account', code: 'BT', fee: 4000 }],
      };

      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify(mockResponse),
      });

      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      const response = await Pop.getPaymentMethod(10000, config);

      expect(response.responseCode).toBe('00');

      const [url, options] = mockFetch.mock.calls[0];
      // getPaymentMethod menggunakan getApiUrl() di PHP Pop.php
      expect(url).toBe(
        'https://sandbox.duitku.com/webapi/api/merchant/paymentmethod/getpaymentmethod'
      );

      const body = JSON.parse(options.body);
      expect(body.signature).toHaveLength(64); // SHA256
      expect(body.datetime).toBeDefined();
    });
  });

  // ============================================================
  // callback
  // ============================================================

  describe('callback', () => {
    it('should validate signature and return notification (test vector from ParamsCallback.json)', () => {
      const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001', true);
      config.setDuitkuLogs(false);

      const notification = Pop.callback(paramsCallback, config);

      expect(notification.resultCode).toBe('00');
      expect(notification.merchantOrderId).toBe('12345');
      expect(notification.reference).toBe('D00015HL5BJKRM27MCUS');
    });

    it('should throw Access denied for empty body', () => {
      const config = new Config('test-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      expect(() => Pop.callback({}, config)).toThrow('Access denied');
    });

    it('should throw Signature Invalid for wrong signature', () => {
      const config = new Config('wrong-api-key', 'D0001', true);
      config.setDuitkuLogs(false);

      expect(() => Pop.callback(paramsCallback, config)).toThrow('Signature Invalid');
    });
  });
});
