import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request } from '../src/Request';
import { Config } from '../src/Config';
import { DuitkuError } from '../src/errors';

// Mock node:fs untuk test logging
vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  appendFileSync: vi.fn(),
  existsSync: vi.fn(() => true),
}));

// Import setelah mock agar mock diterapkan
import { mkdirSync, appendFileSync, existsSync } from 'node:fs';

/**
 * Subclass test untuk mengakses protected methods.
 * Di PHP, sendRequest adalah protected, jadi kita perlu subclass untuk test.
 */
class TestRequest extends Request {
  static async testSendRequest(
    url: string,
    params: string,
    config: Config,
    setLogFunction: string,
    headerParam: Record<string, string> = {}
  ): Promise<string> {
    return this.sendRequest(url, params, config, setLogFunction, headerParam);
  }

  static testWriteDuitkuLogs(
    setLogFunction: string,
    url: string,
    method: string,
    logRequest: string,
    logResponse: string,
    config: Config
  ): void {
    this.writeDuitkuLogs(setLogFunction, url, method, logRequest, logResponse, config);
  }

  static testWriteDuitkuLogsCallback(url: string, logRequest: string, config: Config): void {
    this.writeDuitkuLogsCallback(url, logRequest, config);
  }
}

describe('Request', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ============================================================
  // sendRequest
  // ============================================================

  describe('sendRequest', () => {
    it('should send POST request with JSON content type', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => '{"statusCode":"00"}',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      await TestRequest.testSendRequest(
        'https://example.com/api',
        '{"test":"data"}',
        config,
        'Test->method'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://example.com/api');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.body).toBe('{"test":"data"}');
    });

    it('should NOT set Content-Length header manually', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => '{"statusCode":"00"}',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      await TestRequest.testSendRequest(
        'https://example.com/api',
        '{"test":"data"}',
        config,
        'Test->method'
      );

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Content-Length']).toBeUndefined();
    });

    it('should merge additional headers', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => '{"statusCode":"00"}',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      const customHeaders = {
        'x-duitku-signature': 'abc123',
        'x-duitku-timestamp': '1234567890',
      };

      await TestRequest.testSendRequest(
        'https://example.com/api',
        '{"test":"data"}',
        config,
        'Test->method',
        customHeaders
      );

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['x-duitku-signature']).toBe('abc123');
      expect(options.headers['x-duitku-timestamp']).toBe('1234567890');
      expect(options.headers['Content-Type']).toBe('application/json');
    });

    it('should return response body as string', async () => {
      const responseBody = '{"statusCode":"00","statusMessage":"SUCCESS"}';
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => responseBody,
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      const result = await TestRequest.testSendRequest(
        'https://example.com/api',
        '{}',
        config,
        'Test->method'
      );

      expect(result).toBe(responseBody);
    });

    it('should throw DuitkuError when status >= 400', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        text: async () => 'Bad Request',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      await expect(
        TestRequest.testSendRequest('https://example.com/api', '{}', config, 'Test->method')
      ).rejects.toThrow(DuitkuError);

      await expect(
        TestRequest.testSendRequest('https://example.com/api', '{}', config, 'Test->method')
      ).rejects.toThrow('Duitku Error: 400 response: Bad Request');
    });

    it('should throw DuitkuError with statusCode and responseBody', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      try {
        await TestRequest.testSendRequest('https://example.com/api', '{}', config, 'Test->method');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(DuitkuError);
        const duitkuError = error as DuitkuError;
        expect(duitkuError.statusCode).toBe(500);
        expect(duitkuError.responseBody).toBe('Internal Server Error');
      }
    });

    it('should not throw for status 399', async () => {
      mockFetch.mockResolvedValue({
        status: 399,
        text: async () => 'OK',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      const result = await TestRequest.testSendRequest(
        'https://example.com/api',
        '{}',
        config,
        'Test->method'
      );

      expect(result).toBe('OK');
    });
  });

  // ============================================================
  // writeDuitkuLogs
  // ============================================================

  describe('writeDuitkuLogs', () => {
    it('should write logs when duitkuLogs is enabled', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogs(
        'Test->method',
        'https://example.com/api',
        'POST',
        '{"request":"data"}',
        '{"response":"data"}',
        config
      );

      // Verifikasi appendFileSync dipanggil 6 kali (Date, METHOD, FUNCTION, URL, REQUEST, RESPONSE)
      expect(appendFileSync).toHaveBeenCalledTimes(6);
    });

    it('should not write logs when duitkuLogs is disabled', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      TestRequest.testWriteDuitkuLogs(
        'Test->method',
        'https://example.com/api',
        'POST',
        '{"request":"data"}',
        '{"response":"data"}',
        config
      );

      expect(appendFileSync).not.toHaveBeenCalled();
    });

    it('should not write logs when logRequest is empty', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogs(
        'Test->method',
        'https://example.com/api',
        'POST',
        '', // empty logRequest
        '{"response":"data"}',
        config
      );

      expect(appendFileSync).not.toHaveBeenCalled();
    });

    it('should write correct log format', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogs(
        'Pop->createInvoice',
        'https://api-sandbox.duitku.com/api/merchant/createInvoice',
        'POST',
        '{"paymentAmount":10000}',
        '{"statusCode":"00"}',
        config
      );

      const calls = (appendFileSync as any).mock.calls;

      // Verifikasi setiap baris log
      expect(calls[0][1]).toMatch(/^Date:\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\r\n$/);
      expect(calls[1][1]).toBe('METHOD:POST\r\n');
      expect(calls[2][1]).toBe('FUNCTION:Pop->createInvoice\r\n');
      expect(calls[3][1]).toBe('URL:https://api-sandbox.duitku.com/api/merchant/createInvoice\r\n');
      expect(calls[4][1]).toBe('REQUEST:{"paymentAmount":10000}\r\n');
      expect(calls[5][1]).toBe('RESPONSE:{"statusCode":"00"}\r\n\r\n');
    });

    it('should create logs directory if not exists', () => {
      // Override existsSync untuk return false
      (existsSync as any).mockReturnValue(false);

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogs(
        'Test->method',
        'https://example.com/api',
        'POST',
        '{"request":"data"}',
        '{"response":"data"}',
        config
      );

      expect(mkdirSync).toHaveBeenCalled();

      // Reset mock
      (existsSync as any).mockReturnValue(true);
    });
  });

  // ============================================================
  // writeDuitkuLogsCallback
  // ============================================================

  describe('writeDuitkuLogsCallback', () => {
    it('should write callback logs when duitkuLogs is enabled', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogsCallback('callback', '{"merchantCode":"D0001"}', config);

      // Verifikasi appendFileSync dipanggil 3 kali (Date, URL, CALLBACK REQUEST)
      expect(appendFileSync).toHaveBeenCalledTimes(3);
    });

    it('should not write callback logs when duitkuLogs is disabled', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(false);

      TestRequest.testWriteDuitkuLogsCallback('callback', '{"merchantCode":"D0001"}', config);

      expect(appendFileSync).not.toHaveBeenCalled();
    });

    it('should not write callback logs when logRequest is empty', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogsCallback(
        'callback',
        '', // empty logRequest
        config
      );

      expect(appendFileSync).not.toHaveBeenCalled();
    });

    it('should write correct callback log format', () => {
      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      TestRequest.testWriteDuitkuLogsCallback(
        'callback',
        '{"merchantCode":"D0001","amount":10000}',
        config
      );

      const calls = (appendFileSync as any).mock.calls;

      expect(calls[0][1]).toMatch(/^Date:\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\r\n$/);
      expect(calls[1][1]).toBe('URL:callback\r\n');
      expect(calls[2][1]).toBe('CALLBACK REQUEST:{"merchantCode":"D0001","amount":10000}\r\n\r\n');
    });
  });

  // ============================================================
  // Integration: sendRequest with logging
  // ============================================================

  describe('sendRequest with logging', () => {
    it('should write logs after successful request', async () => {
      mockFetch.mockResolvedValue({
        status: 200,
        text: async () => '{"statusCode":"00"}',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      await TestRequest.testSendRequest(
        'https://example.com/api',
        '{"test":"data"}',
        config,
        'Test->method'
      );

      // Verifikasi logging dipanggil (6 baris log)
      expect(appendFileSync).toHaveBeenCalledTimes(6);
    });

    it('should write logs even when request fails', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const config = new Config('key', 'D0001');
      config.setDuitkuLogs(true);

      try {
        await TestRequest.testSendRequest(
          'https://example.com/api',
          '{"test":"data"}',
          config,
          'Test->method'
        );
      } catch {
        // Expected to throw
      }

      // Log tetap ditulis meskipun request gagal
      expect(appendFileSync).toHaveBeenCalledTimes(6);
    });
  });
});
