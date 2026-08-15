/**
 * Contoh Create Invoice menggunakan Duitku-Pop di Bun.
 *
 * Run: bun examples/bun/createInvoice-pop.ts
 */

import { Config, Pop } from '../../src/index';

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

const paymentAmount = 10000;
const email = 'customer@gmail.com';
const phoneNumber = '081234567890';
const productDetails = 'Test Payment';
const merchantOrderId = `order-${Date.now()}`;
const customerVaName = 'John Doe';
const callbackUrl = 'http://YOUR_SERVER/callback';
const returnUrl = 'http://YOUR_SERVER/return';
const expiryPeriod = 60;

const address = {
  firstName: 'John',
  lastName: 'Doe',
  address: 'Jl. Kembangan Raya',
  city: 'Jakarta',
  postalCode: '11530',
  phone: phoneNumber,
  countryCode: 'ID',
};

const customerDetail = {
  firstName: 'John',
  lastName: 'Doe',
  email,
  phoneNumber,
  billingAddress: address,
  shippingAddress: address,
};

const itemDetails = [{ name: productDetails, price: paymentAmount, quantity: 1 }];

const params = {
  paymentAmount,
  merchantOrderId,
  productDetails,
  customerVaName,
  email,
  phoneNumber,
  itemDetails,
  customerDetail,
  callbackUrl,
  returnUrl,
  expiryPeriod,
};

try {
  const response = await Pop.createInvoice(params, config);
  console.log('=== Create Invoice Response (Pop) ===');
  console.log(JSON.stringify(response, null, 2));
  console.log('Payment URL:', response.paymentUrl);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error:', message);
}
