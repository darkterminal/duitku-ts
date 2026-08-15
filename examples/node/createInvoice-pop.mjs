/**
 * Contoh Create Invoice menggunakan Duitku-Pop di Node.js.
 *
 * Run: node examples/node/createInvoice-pop.mjs
 */

import { Config, Pop } from '../../dist/index.js';

// ============================================================
// Konfigurasi
// ============================================================

const config = new Config('732B39FC61796845775D2C4FB05332AF', 'D0001');
config.setSandboxMode(true);
config.setDuitkuLogs(false);

// ============================================================
// Parameter Invoice
// ============================================================

const paymentAmount = 10000;
const email = 'customer@gmail.com';
const phoneNumber = '081234567890';
const productDetails = 'Test Payment';
const merchantOrderId = `order-${Date.now()}`; // unik
const additionalParam = '';
const merchantUserInfo = '';
const customerVaName = 'John Doe';
const callbackUrl = 'http://YOUR_SERVER/callback';
const returnUrl = 'http://YOUR_SERVER/return';
const expiryPeriod = 60;

// Customer Detail
const firstName = 'John';
const lastName = 'Doe';

// Address
const address = {
  firstName,
  lastName,
  address: 'Jl. Kembangan Raya',
  city: 'Jakarta',
  postalCode: '11530',
  phone: phoneNumber,
  countryCode: 'ID',
};

const customerDetail = {
  firstName,
  lastName,
  email,
  phoneNumber,
  billingAddress: address,
  shippingAddress: address,
};

// Item Details
const itemDetails = [
  {
    name: productDetails,
    price: paymentAmount,
    quantity: 1,
  },
];

// ============================================================
// Create Invoice
// ============================================================

const params = {
  paymentAmount,
  merchantOrderId,
  productDetails,
  additionalParam,
  merchantUserInfo,
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
  console.log('');
  console.log('Payment URL:', response.paymentUrl);
  console.log('Reference:', response.reference);
} catch (error) {
  console.error('Error:', error.message);
  if (error.statusCode) {
    console.error('HTTP Status:', error.statusCode);
  }
  if (error.responseBody) {
    console.error('Response Body:', error.responseBody);
  }
}
