/**
 * Contoh Create Invoice menggunakan Duitku-API di Bun.
 *
 * Run: bun examples/bun/createInvoice-api.ts
 */

import { Config, Api } from '../../src/index';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const params = {
  paymentAmount: 10000,
  paymentMethod: 'BT', // WAJIB untuk Duitku-API
  merchantOrderId: `order-${Date.now()}`,
  productDetails: 'Test Payment',
  email: 'customer@gmail.com',
  phoneNumber: '081234567890',
  customerVaName: 'John Doe',
  callbackUrl: 'http://YOUR_SERVER/callback',
  returnUrl: 'http://YOUR_SERVER/return',
  expiryPeriod: 60,
};

try {
  const response = await Api.createInvoice(params, config);
  console.log('=== Create Invoice Response (Api) ===');
  console.log(JSON.stringify(response, null, 2));
  console.log('Payment URL:', response.paymentUrl);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
}
